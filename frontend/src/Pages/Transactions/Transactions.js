import TransactionForm from "../../Components/TransactionForm/TransactionForm";
import "./Transactions.css";

function Transactions() {
  return (
    <div className="transactions-page">
      <h1>Add a Transaction</h1>
      <TransactionForm />
    </div>
  );
}

export default Transactions;
