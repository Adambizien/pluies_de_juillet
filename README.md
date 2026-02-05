# Pluies de Juillet

Un projet Next.js avec TypeORM et PostgreSQL pour gérer les utilisateurs.

## Prérequis

- Node.js et npm
- PostgreSQL

## Installation et Démarrage

### 1. Cloner le projet

```bash
git clone https://github.com/Adambizien/pluies_de_juillet.git
cd pluies_de_juillet
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer la base de données

#### a) Installer PostgreSQL (si pas déjà installé)

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

**macOS (avec Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### b) Créer la base de données

```bash
PGPASSWORD=postgres psql -U postgres -h localhost < src/migrations/01-init-database.sql
```

Si tu as un autre mot de passe, remplace `postgres` dans la commande et dans le fichier `.env.local`.

### 4. Configurer les variables d'environnement

Crée un fichier `.env.local` à la racine du projet :

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=pluies_de_juillet
DB_SYNC=true
DB_LOGGING=false
```

> ⚠️ Modifie les valeurs selon ta configuration PostgreSQL.

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Le site sera accessible à `http://localhost:3000`

Au démarrage, tu devrais voir :
```
Database connected successfully
```

Les tables `users` et `user_info` seront créées automatiquement.

## Créer un compte administrateur

Pour créer un compte administrateur directement via la CLI :

```bash
npm run create-admin
```

Le script te demandera interactivement :
- **Email** : L'adresse email du compte admin
- **Mot de passe** : Au minimum 12 caractères (1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial)
- **Prénom** : Le prénom de l'administrateur
- **Nom** : Le nom de l'administrateur (optionnel)
- **Téléphone** : Format français (06/07 XX XX XX XX ou +33 6/7 XX XX XX XX) (optionnel)
- **Date de naissance** : Format YYYY-MM-DD (optionnel)

**Exemple :**
```
Email: admin@example.com
Mot de passe: MyPassword123!@#
Prénom: Jean
Nom: Dupont
Téléphone: 06 12 34 56 78
Date de naissance: 1990-05-15
✅ Compte administrateur créé avec succès
```