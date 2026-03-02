import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { MongoClient } from "mongodb"

const validRoles = new Set(["doctor", "health_worker", "pharmacist"])
const pharmaciesById = {
  "pharmacy-1": "Jan Aushadhi Kendra - Moga",
  "pharmacy-2": "Rural Health Pharmacy - Bathinda",
  "pharmacy-3": "Gram Seva Medical Store - Sangrur",
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, "utf8")
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue
    const eqIndex = line.indexOf("=")
    if (eqIndex === -1) continue
    const key = line.slice(0, eqIndex).trim()
    const value = line.slice(eqIndex + 1).trim()
    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith("--")) continue
    const key = token.slice(2)
    const value = argv[i + 1]
    if (!value || value.startsWith("--")) {
      args[key] = "true"
      continue
    }
    args[key] = value
    i += 1
  }
  return args
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

function usage() {
  console.log(
    "Usage: npm run db:grant-access -- --name \"Name\" --email \"mail@example.com\" --password \"Secret123\" --role doctor [--phone \"+91...\"] [--pharmacyId pharmacy-1] [--inactive]"
  )
}

loadEnvFile(path.join(process.cwd(), ".env.local"))
loadEnvFile(path.join(process.cwd(), ".env"))

const args = parseArgs(process.argv.slice(2))
const rawArgv = process.argv.slice(2)

let name = args.name
let email = args.email
let password = args.password
let role = args.role
const phone = args.phone
let pharmacyIdArg = args.pharmacyId
const isActive = !args.inactive

if (!name || !email || !password || !role) {
  if (rawArgv.length >= 4 && !rawArgv.some((token) => token.startsWith("--"))) {
    const lastToken = rawArgv[rawArgv.length - 1]
    if (lastToken in pharmaciesById && rawArgv.length >= 5) {
      pharmacyIdArg = lastToken
      role = rawArgv[rawArgv.length - 2]
      password = rawArgv[rawArgv.length - 3]
      email = rawArgv[rawArgv.length - 4]
      name = rawArgv.slice(0, rawArgv.length - 4).join(" ")
    } else {
      role = rawArgv[rawArgv.length - 1]
      password = rawArgv[rawArgv.length - 2]
      email = rawArgv[rawArgv.length - 3]
      name = rawArgv.slice(0, rawArgv.length - 3).join(" ")
    }
  }
}

if (!name || !email || !password || !role) {
  usage()
  process.exit(1)
}

if (!validRoles.has(role)) {
  console.error("Invalid role. Use one of: doctor, health_worker, pharmacist")
  process.exit(1)
}

if (role === "pharmacist" && !pharmacyIdArg) {
  console.error("For pharmacist role, --pharmacyId is required (pharmacy-1|pharmacy-2|pharmacy-3).")
  process.exit(1)
}

if (pharmacyIdArg && !(pharmacyIdArg in pharmaciesById)) {
  console.error("Invalid pharmacyId. Use pharmacy-1, pharmacy-2, or pharmacy-3.")
  process.exit(1)
}

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is required")
  process.exit(1)
}

const dbName = process.env.MONGODB_DB_NAME || "rural_health_portal"
const client = new MongoClient(process.env.MONGODB_URI)

try {
  await client.connect()
  const users = client.db(dbName).collection("users")
  await users.createIndex({ email: 1 }, { unique: true })

  const normalizedEmail = email.trim().toLowerCase()
  const existing = await users.findOne({ email: normalizedEmail })
  const id = existing?.id ?? `usr-${crypto.randomUUID()}`

  const pharmacyName = pharmacyIdArg ? pharmaciesById[pharmacyIdArg] : null
  await users.updateOne(
    { email: normalizedEmail },
    {
      $set: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        role,
        phone: phone ? phone.trim() : null,
        pharmacyId: role === "pharmacist" ? pharmacyIdArg : null,
        pharmacyName: role === "pharmacist" ? pharmacyName : null,
        isActive,
      },
      $setOnInsert: {
        id,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  )

  console.log(`Granted/updated access for ${normalizedEmail} (${role})`)
} catch (error) {
  if (error && typeof error === "object" && "code" in error) {
    const code = String(error.code)
    if (code === "18") {
      console.error("MongoDB auth failed: invalid username/password in MONGODB_URI.")
    } else {
      console.error(`MongoDB error (${code}).`)
    }
  } else {
    console.error("Unexpected error while granting access.")
  }
  process.exitCode = 1
} finally {
  await client.close()
}
