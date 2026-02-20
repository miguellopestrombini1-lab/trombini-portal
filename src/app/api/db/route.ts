import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

export async function GET() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const newData = await request.json();
        fs.writeFileSync(DB_PATH, JSON.stringify(newData, null, 2), 'utf8');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
    }
}
