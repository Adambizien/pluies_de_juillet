import { AppDataSource } from "@/src/data-source";
import { User, UserRole } from "@/src/entities/User";
import { UserInfo } from "@/src/entities/UserInfo";
import { validatePassword } from "@/lib/passwordValidator";
import * as bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstname, lastname, phone, dateOfBirth } = body;

    // Valider les inputs
    if (!email || !password || !firstname) {
      return NextResponse.json(
        { error: "Email, password et firstname sont requis" },
        { status: 400 }
      );
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(", ") },
        { status: 400 }
      );
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepository = AppDataSource.getRepository(User);
    const userInfoRepository = AppDataSource.getRepository(UserInfo);

    // Vérifier si l'utilisateur existe
    const existingUser = await userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = userRepository.create({
      email,
      password: hashedPassword,
      role: UserRole.USER,
    });

    const savedUser = await userRepository.save(newUser);

    // Créer les infos utilisateur
    const newUserInfo = userInfoRepository.create({
      userId: savedUser.id,
      firstname,
      lastname: lastname || null,
      phone: phone || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
    });

    await userInfoRepository.save(newUserInfo);

    return NextResponse.json(
      {
        message: "Inscription réussie",
        user: {
          id: savedUser.id,
          email: savedUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
