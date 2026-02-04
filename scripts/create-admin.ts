import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

const envPath = resolve(__dirname, "../.env.local");

if (existsSync(envPath)) {
  const result = config({ path: envPath, override: true });
  if (result.error) {
    console.error("❌ Erreur lors du chargement du .env.local:", result.error);
    process.exit(1);
  }
} else {
  config();
}
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User, UserRole } from "../src/entities/User";
import { UserInfo } from "../src/entities/UserInfo";
import { EventCategory } from "../src/entities/EventCategory";
import { ConferenceCategory } from "../src/entities/ConferenceCategory";
import { Event } from "../src/entities/Event";
import { Conference } from "../src/entities/Conference";
import { UserProgram } from "../src/entities/UserProgram";
import { Registration } from "../src/entities/Registration";
import * as bcrypt from "bcryptjs";
import * as readline from "readline";
import { validatePassword } from "../lib/passwordValidator";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  synchronize: false,
  logging: false,
  entities: [User, UserInfo, EventCategory, ConferenceCategory, Event, Conference, UserProgram, Registration],
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    let email = await question("Email: ");
    email = email.toLowerCase().trim();
    
    const password = await question("Mot de passe: ");
    const firstname = await question("Prénom: ");
    const lastname = await question("Nom: ");
    const phone = await question("Téléphone (optionnel): ");
    const dateOfBirthStr = await question("Date de naissance (YYYY-MM-DD, optionnel): ");

    rl.close();

    if (!email || !password || !firstname) {
      console.error("❌ Email, mot de passe et prénom sont requis");
      process.exit(1);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      console.error("❌ Le mot de passe ne respecte pas les critères de sécurité:");
      passwordValidation.errors.forEach((error) => {
        console.error(`   - ${error}`);
      });
      process.exit(1);
    }

    if (phone && phone.trim()) {
      const phoneRegex = /^(?:\+33[1-9]|0[1-9])[0-9]{8}$/;
      const cleanPhone = phone.replace(/\s+/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        console.error("❌ Le numéro de téléphone n'est pas valide. Format attendu: 06 12 34 56 78");
        process.exit(1);
      }
    }

    if (dateOfBirthStr && dateOfBirthStr.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateOfBirthStr)) {
        console.error("❌ Le format de la date de naissance n'est pas valide. Format attendu: YYYY-MM-DD");
        process.exit(1);
      }
      const dateObj = new Date(dateOfBirthStr);
      if (isNaN(dateObj.getTime())) {
        console.error("❌ La date de naissance n'est pas valide");
        process.exit(1);
      }
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepository = AppDataSource.getRepository(User);
    const userInfoRepository = AppDataSource.getRepository(UserInfo);


    const existingUser = await userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      console.error(`❌ Un utilisateur avec l'email ${email} existe déjà`);
      await AppDataSource.destroy();
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    const savedUser = await userRepository.save(newUser);

    const newUserInfo = userInfoRepository.create({
      userId: savedUser.id,
      firstname,
      lastname: lastname || null,
      phone: phone || null,
      dateOfBirth: dateOfBirthStr ? new Date(dateOfBirthStr) : null,
    });

    await userInfoRepository.save(newUserInfo);

    console.log("✅ Compte administrateur créé avec succès");

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'admin:", error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

createAdmin();
