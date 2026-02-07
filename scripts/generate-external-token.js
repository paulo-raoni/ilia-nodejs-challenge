import jwt from 'jsonwebtoken';

const userId = process.argv[2];
const secret = process.env.JWT_EXTERNAL_SECRET;

if (!userId) {
  console.error('Missing argument: userId');
  process.exit(1);
}

if (!secret) {
  console.error('Missing env var: JWT_EXTERNAL_SECRET');
  process.exit(1);
}

const token = jwt.sign({ sub: userId }, secret, { expiresIn: '1h' });
process.stdout.write(token);
