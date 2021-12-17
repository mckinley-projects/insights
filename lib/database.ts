import * as SQLite from "expo-sqlite";
import { documentDirectory } from "expo-file-system";

// What are debits and credits? In a nutshell:
// debits (dr) record all of the money flowing into an account.
// credits (cr) record all of the money flowing out of an account.

export interface Transaction {
  id: number;
  type: string; // debit or credit
  amount: number;
  date: string;
  refrence: string;
  merchantId: number;
}

export interface ITransaction {
  type: "debit" | "credit"; // debit or credit
  amount: number;
  date: string;
  refrence: string;
  merchantId?: number;
}

export interface Merchant {
  id: number;
  name: string;
  refrence: string;
}

class Database {
  private db: SQLite.WebSQLDatabase;

  constructor() {
    this.db = SQLite.openDatabase("insigts.db");

    console.log("Database created", `${documentDirectory}SQLite/insigts.db`);
  }

  // singleton instance
  private static instance: Database;

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  init() {
    // create tables
    this.runQuery(
      `CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            refrence TEXT NOT NULL
        )`
    );

    // this.runQuery(
    //   `CREATE TABLE IF NOT EXISTS merchants (
    //         id INTEGER PRIMARY KEY AUTOINCREMENT,
    //         name TEXT,
    //         refrence TEXT NOT NULL UNIQUE,
    //     )`
    // );
  }

  async insertTransaction(transcation: ITransaction) {
    return this.runQuery(
      `INSERT INTO transactions (type, amount, date, refrence) VALUES (?,?,?,?)`,
      [
        transcation.type,
        transcation.amount,
        transcation.date,
        transcation.refrence,
      ]
    );
  }

  async transactions() {
    const result = await this.runQuery(
      `SELECT * FROM transactions ORDER BY date DESC`
    );
    return result.rows._array as Transaction[];
  }

  runQuery(sql: string, args?: (string | number)[] | undefined) {
    return new Promise<any>((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(sql, args, (tx, results) => {
            resolve(results);
          });
        },
        (err) => {
          reject(err);
        }
      );
    });
  }
}

export default Database.getInstance();
