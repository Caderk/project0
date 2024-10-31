# Frontend Service

We will be developing a front end service using Next.js.

We will follow these instructions: https://nextjs.org/docs/getting-started/installation#manual-installation

First we install the necessary npm packages for a Next.js app:
```
npm install next@latest react@latest react-dom@latest
```

Then we will add the following scripts to the package.json that was just created:
```
npm pkg set scripts.dev="next dev"
npm pkg set scripts.build="next build"
npm pkg set scripts.start="next start"
npm pkg set scripts.lint="next lint"
```

Before running any script we should add some files to render:
```
mkdir app

cat > app/layout.tsx << 'EOF'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
EOF

cat > app/page.tsx << 'EOF'
export default function Page() {
  return <h1>Hello, Next.js!</h1>
}
EOF
```

If we want to use typescript we should do:
```
npm install --save-dev typescript @types/react @types/node
```
We also would need to create a tsconfig.js file:
```
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "incremental": true,
    "module": "esnext",
    "esModuleInterop": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "plugins": [{ "name": "next" }]
  },
  "include": [
    "next-env.d.ts",
    ".next/types/**/*.ts",
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": ["node_modules"]
}
EOF
```