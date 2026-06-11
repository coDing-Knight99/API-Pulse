import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
    console.log("Redis connected");
});

redis.on("error", (err) => {
    console.error(err);
});

async function test() {

    await redis.set("hello", "world");

    const val = await redis.get("hello");

    console.log(val);

    process.exit(0);
}

test();