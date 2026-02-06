import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const baseDir = path.resolve("local_backups/images");

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const getFileExt = (url) => {
  try {
    const parsed = new URL(url);
    const ext = path.extname(parsed.pathname);
    return ext || ".jpg";
  } catch {
    return ".jpg";
  }
};

const run = async () => {
  await ensureDir(baseDir);

  const { data, error } = await supabase
    .from("cleaning_logs")
    .select("id, created_at, image_url")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    process.exit(1);
  }

  for (const row of data) {
    if (!row.image_url) continue;
    const date = row.created_at ? row.created_at.slice(0, 10) : "unknown";
    const dayDir = path.join(baseDir, date);
    await ensureDir(dayDir);

    const ext = getFileExt(row.image_url);
    const filename = path.join(dayDir, `${row.id}${ext}`);

    try {
      await fs.access(filename);
      console.log(`Skip ${filename}`);
      continue;
    } catch {
      // file does not exist
    }

    const res = await fetch(row.image_url);
    if (!res.ok) {
      console.log(`Failed to download ${row.image_url}`);
      continue;
    }

    const arrayBuffer = await res.arrayBuffer();
    await fs.writeFile(filename, Buffer.from(arrayBuffer));
    console.log(`Saved ${filename}`);
  }
};

run();
