import jwt from 'jsonwebtoken';

const userId = process.argv[2];
const secret = process.env.JWT_INTERNAL_SECRET;


if (!userId) {
  console.error('Missing argument: userId');
  process.exit(1);
}

if (!secret) {
  console.error('Missing env var: JWT_INTERNAL_SECRET');
  process.exit(1);
}

const token = jwt.sign({ sub: userId, internal: true }, secret, { expiresIn: '5m' });
process.stdout.write(token);
