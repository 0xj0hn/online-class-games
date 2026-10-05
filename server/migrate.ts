import { db } from '../api/lib/db'
import { CREATE_TABLE, CREATE_INDEX } from '../api/lib/queries'

export async function migrate(): Promise<void> {
  await db().execute(CREATE_TABLE)
  await db().execute(CREATE_INDEX)
}