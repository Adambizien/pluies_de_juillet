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


#### Créer la base de données

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

Les tables suivantes seront créées automatiquement :
- **users** - Comptes utilisateurs (email, password, rôle)
- **user_info** - Informations utilisateur (prénom, nom, téléphone, date de naissance)
- **event_categories** - Catégories d'événements
- **events** - Événements (titre, description, date, prix, etc.)
- **conference_categories** - Catégories de conférences
- **conferences** - Conférences associées aux événements
- **registrations** - Inscriptions des utilisateurs aux événements
- **user_programs** - Programme personnalisé des utilisateurs

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