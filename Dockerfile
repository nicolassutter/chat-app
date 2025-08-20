FROM oven/bun:1

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

CMD ["bun", "run", "start"]
