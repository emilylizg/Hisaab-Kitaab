import TransactionForm from "../../Components/TransactionForm/TransactionForm";
import transactionService from "../../services/transactionService";
import "./Transactions.css";

function Transactions() {

  const handleAddTransaction = async (data) => {
    try {
      await transactionService.addTransaction(data);
      console.log("Transaction added successfully");
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  return (
    <div className="transactions-page">
      <h1>Add a Transaction</h1>
      <TransactionForm onSubmit={handleAddTransaction} />
    </div>
  );
}

export default Transactions;