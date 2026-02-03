# Pluies de Juillet

Un projet Next.js avec TypeORM et PostgreSQL pour gérer les utilisateurs.

## 📋 Prérequis

- Node.js 18+ et npm
- PostgreSQL 12+

## 🚀 Installation et Démarrage

### 1. Cloner le projet

```bash
git clone <repo-url>
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
✅ Database connected successfully
```

Les tables `users` et `user_info` seront créées automatiquement.