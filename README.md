# 91W CMS - Admin Content Management System

A modern, responsive admin CMS built with Next.js 14, JavaScript, and MySQL for managing 91Wheels content.

## Features

- **User Management**: Create, edit, and delete users with role-based access (Admin, Editor, Viewer)
- **Post Management**: Full CRUD operations for blog posts and articles
- **Modern UI**: Clean, responsive interface built with Tailwind CSS
- **Real-time Search**: Search through users and posts instantly
- **Database Integration**: MySQL database with connection pooling
- **JavaScript**: Modern ES6+ JavaScript with JSX

## Tech Stack

- **Frontend**: Next.js 14, React 18, JavaScript
- **Styling**: Tailwind CSS, Lucide React Icons
- **Database**: MySQL 2
- **API**: Next.js API Routes
- **UI Components**: Custom components with Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ 
- MySQL database
- npm or yarn

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd /Users/apple/Desktop/personal_project/91w-cms
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   The `.env.local` file is already configured with your database credentials:
   ```
   DB_HOST=3.6.145.79
   DB_HOST_ALT=localhost
   DB_USER=91w_staging
   DB_PASSWORD=91w@8iut
   DB_NAME=91wheels
   ```

4. **Set up the database**:
   Run the SQL script to create tables and sample data:
   ```bash
   mysql -h 3.6.145.79 -u 91w_staging -p91w@8iut 91wheels < database.sql
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── users/          # User CRUD API endpoints
│   │   └── posts/          # Post CRUD API endpoints
│   ├── globals.css         # Global styles
│   ├── layout.js           # Root layout
│   └── page.js             # Main dashboard
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── UsersManager.js     # User management interface
│   └── PostsManager.js     # Post management interface
├── lib/
│   ├── db.js               # Database connection and utilities
│   └── utils.js            # Utility functions
```

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post
- `GET /api/posts/[id]` - Get post by ID
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `role` - User role (admin, editor, viewer)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Posts Table
- `id` - Primary key
- `title` - Post title
- `content` - Post content
- `slug` - URL-friendly slug
- `status` - Post status (draft, published, archived)
- `author_id` - Foreign key to users table
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Usage

### Managing Users
1. Navigate to the Users tab in the sidebar
2. Click "Add User" to create new users
3. Use the search bar to find specific users
4. Click edit/delete buttons to modify users

### Managing Posts
1. Navigate to the Posts tab in the sidebar
2. Click "Add Post" to create new content
3. Fill in title, content, slug, status, and author
4. Use the search functionality to find posts
5. Edit or delete posts as needed

## Development

### Adding New Features
1. Create API routes in `src/app/api/`
2. Add TypeScript types in `src/types/`
3. Create UI components in `src/components/`
4. Update database schema in `database.sql`

### Styling
- Uses Tailwind CSS for styling
- Custom components follow shadcn/ui patterns
- Responsive design for mobile and desktop

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary to 91Wheels.

## Support

For support and questions, contact the development team.
