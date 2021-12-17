import React, { useEffect } from "react";
import { View, Text, FlatList, Dimensions, ScrollView } from "react-native";
import { Button } from "react-native-paper";
import Header from "./header";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import CSV from "./csv";
import database, { Transaction } from "./database";
import moment from "moment";
import { BarChart, Grid } from "react-native-svg-charts";

export default function Dashboard() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);

  interface TransactionMonthly {
    month: number;
    amount: number;
  }

  const [transcationsFY21, setTranscationsFY21] = React.useState<
    TransactionMonthly[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const transactions = await database.transactions();
        setTransactions(transactions);

        const transactionsFY21 = transactions.filter(
          (transaction) =>
            moment(transaction.date, "MM-DD-YYYY").year() === 2020
        );

        const transcationsFY21 = [
          { month: 1, amount: 0 },
          { month: 2, amount: 0 },
          { month: 3, amount: 0 },
          { month: 4, amount: 0 },
          { month: 5, amount: 0 },
          { month: 6, amount: 0 },
          { month: 7, amount: 0 },
          { month: 8, amount: 0 },
          { month: 9, amount: 0 },
          { month: 10, amount: 0 },
          { month: 11, amount: 0 },
          { month: 12, amount: 0 },
        ];

        transactionsFY21.map((transaction) => {
          const month = moment(transaction.date, "MM-DD-YYYY").month();
          transcationsFY21[month].amount += transaction.amount;
        });

        setTranscationsFY21(transcationsFY21);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  return (
    <View>
      <Header></Header>

      {/* <ScrollView horizontal={true}> */}
      <BarChart
        style={{ height: 200 }}
        data={transcationsFY21.map((transaction) => transaction.amount)}
        contentInset={{ top: 20, bottom: 20 }}
        svg={{ fill: "rgba(134, 65, 244, 0.8)" }}
      ></BarChart>
      {/* </ScrollView> */}
    </View>
  );
}

function SyncTranscations() {
  return (
    <View>
      <Button
        style={{
          backgroundColor: "#fff",
          margin: 20,
        }}
        onPress={async () => {
          try {
            const doc = await DocumentPicker.getDocumentAsync({
              type: "text/csv",
              copyToCacheDirectory: false,
            });

            if (doc.type === "success") {
              const { uri } = doc;
              const file = await FileSystem.readAsStringAsync(uri);
              // var data: any = new CSV(file).parse();

              var rows = file.split("\r\n");
              var table = rows.map((row: string) => row.split(","));

              var titles = [
                "DATE",
                "MODE",
                "PARTICULARS",
                "DEPOSITS",
                "WITHDRAWALS",
                "BALANCE",
              ];

              var checkIfIsICICIStatment =
                table.filter((i) => {
                  if (
                    i[0] === titles[0] &&
                    i[1] === titles[1] &&
                    i[2] === titles[2] &&
                    i[3] === titles[3] &&
                    i[4] === titles[4] &&
                    i[5] === titles[5]
                  ) {
                    return true;
                  }
                }).length > 0;

              if (checkIfIsICICIStatment === false) {
                alert("Not a valid ICICI statement");
                return;
              }

              var data = table.filter((i) => {
                var date = moment(i[0], "DD/MM/YYYY");
                if (date.toDate().getTime() > 0) {
                  // parse deposits
                  var deposits = parseFloat(i[3]);
                  var withdrawals = parseFloat(i[4]);
                  var balance = parseFloat(i[5]);
                  if (isNaN(deposits) && isNaN(withdrawals) && isNaN(balance)) {
                    return false;
                  }
                  return i;
                }
              });

              interface Transaction {
                deposit: string;
                withdrawal: string;
                date: string;
                remarks: string;
              }

              const transactions: Transaction[] = data.map(
                (transaction: any) => {
                  return {
                    deposit: transaction[3],
                    withdrawal: transaction[4],
                    date: transaction[0],
                    remarks: transaction[2],
                  };
                }
              );

              transactions.forEach((transaction: Transaction) => {
                let deposit = parseFloat(transaction.deposit);
                let withdrawal = parseFloat(transaction.withdrawal);

                (async () => {
                  try {
                    if (deposit > 0) {
                      await database.insertTransaction({
                        amount: deposit,
                        date: transaction.date,
                        refrence: transaction.remarks,
                        type: "debit",
                      });
                      console.log("deposit");
                    }

                    if (withdrawal > 0) {
                      await database.insertTransaction({
                        amount: withdrawal,
                        date: transaction.date,
                        refrence: transaction.remarks,
                        type: "credit",
                      });
                      console.log("withdrawal");
                    }
                  } catch (error) {
                    console.log(
                      "error in transcation",
                      transaction.remarks,
                      error
                    );
                  }
                })();
              });

              // await FileSystem.deleteAsync(uri);
            }
          } catch (error) {
            console.log(error);
          }
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Ubuntu-Bold",
            textTransform: "uppercase",
            color: "#000",
          }}
        >
          Sync Transcations
        </Text>
      </Button>
    </View>
  );
}
