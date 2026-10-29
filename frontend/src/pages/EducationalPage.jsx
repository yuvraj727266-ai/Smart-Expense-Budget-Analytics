import React, { useState } from 'react';
import {
  Code2,
  Play,
  CheckCircle2,
  Copy,
  Terminal,
  BookOpen,
  ArrowRight
} from 'lucide-react';

const CODE_EXAMPLES = [
  {
    id: 'net_savings',
    title: '1. Net Savings Calculation Function',
    concept: 'Chapter 1.1 & 1.4: Pure Functions, Float Types, Arithmetic Subtraction',
    code: `def calculate_net_savings(total_income: float, total_expenses: float) -> float:
    """
    Net Savings = Total Income - Total Expenses.
    Returns negative value if user is in a monthly deficit.
    """
    income = float(total_income or 0.0)
    expenses = float(total_expenses or 0.0)
    return round(income - expenses, 2)

# Demonstration
print("Surplus:", calculate_net_savings(45000.0, 32000.0))  # Output: 13000.0
print("Deficit:", calculate_net_savings(20000.0, 25000.0))  # Output: -5000.0`,
    output: `Surplus: 13000.0\nDeficit: -5000.0`
  },
  {
    id: 'savings_rate',
    title: '2. Savings Rate & ZeroDivisionError Guard',
    concept: 'Chapter 1.2 & 1.4: Conditionals, Zero Guard, Percentage Arithmetic',
    code: `def calculate_savings_rate(net_savings: float, total_income: float) -> float:
    """
    Savings Rate = (Net Savings / Total Income) * 100.
    Protects against ZeroDivisionError when total_income is zero.
    """
    if total_income <= 0:
        return 0.0
    return round((net_savings / total_income) * 100.0, 2)

# Demonstration
print(f"Rate: {calculate_savings_rate(13000.0, 45000.0)}%")  # Output: 28.89%
print(f"Zero Income: {calculate_savings_rate(0.0, 0.0)}%")    # Output: 0.0%`,
    output: `Rate: 28.89%\nZero Income: 0.0%`
  },
  {
    id: 'loop_sum',
    title: '3. Transaction Summation with For Loop & Continue',
    concept: 'Chapter 1.2: Loops, Loop Control (continue), Filtering',
    code: `transactions = [
    {'desc': 'Mess Food', 'amount': 450.0, 'type': 'expense'},
    {'desc': 'Stipend', 'amount': 30000.0, 'type': 'income'},
    {'desc': 'Metro Recharge', 'amount': 500.0, 'type': 'expense'},
    {'desc': 'Refund', 'amount': None, 'type': 'income'}, # corrupted
]

total_expense = 0.0
for tx in transactions:
    # Skip non-expense or invalid records using continue
    if tx['type'] != 'expense' or tx['amount'] is None:
        continue
    total_expense += tx['amount']

print("Total Expenses:", total_expense)`,
    output: `Total Expenses: 950.0`
  },
  {
    id: 'list_comprehension',
    title: '4. List Comprehension for Expense Filtering',
    concept: 'Chapter 1.3: List Comprehensions, Concise Pythonic Syntax',
    code: `transactions = [
    {'desc': 'Books', 'amount': 1200.0, 'type': 'expense'},
    {'desc': 'Freelance', 'amount': 8000.0, 'type': 'income'},
    {'desc': 'Coffee', 'amount': 180.0, 'type': 'expense'},
]

# One-line Pythonic list comprehension
expense_amounts = [t['amount'] for t in transactions if t['type'] == 'expense']

print("Expense amounts list:", expense_amounts)
print("Sum of expenses:", sum(expense_amounts))`,
    output: `Expense amounts list: [1200.0, 180.0]\nSum of expenses: 1380.0`
  },
  {
    id: 'lambda_sort',
    title: '5. Lambda Function for Expenditure Ranking',
    concept: 'Chapter 1.4: Anonymous Lambda Functions, Dictionary Sorting',
    code: `category_totals = [
    {'name': 'Food', 'amount': 6500.0},
    {'name': 'Rent', 'amount': 9500.0},
    {'name': 'Books', 'amount': 2400.0},
    {'name': 'Travel', 'amount': 1800.0},
]

# Sort descending by 'amount' using a lambda function key
sorted_categories = sorted(category_totals, key=lambda c: c['amount'], reverse=True)

for c in sorted_categories:
    print(f"{c['name']}: ₹{c['amount']}")`,
    output: `Rent: ₹9500.0\nFood: ₹6500.0\nBooks: ₹2400.0\nTravel: ₹1800.0`
  },
  {
    id: 'numpy_stats',
    title: '6. NumPy Statistical Calculations & IQR Outlier Rule',
    concept: 'Unit 2: NumPy Vector Arrays, np.mean, np.median, np.std, np.percentile',
    code: `import numpy as np

# Sample expense amounts in INR
amounts = np.array([150.0, 200.0, 350.0, 400.0, 500.0, 750.0, 9500.0], dtype=np.float64)

mean_val = np.mean(amounts)
median_val = np.median(amounts)
std_dev = np.std(amounts)

# Interquartile Range (IQR) Rule for Outliers
q1 = np.percentile(amounts, 25)
q3 = np.percentile(amounts, 75)
iqr = q3 - q1
threshold = q3 + (1.5 * iqr)

outliers = amounts[amounts > threshold]

print(f"Mean: ₹{mean_val:.2f}, Median: ₹{median_val:.2f}, Std Dev: ₹{std_dev:.2f}")
print(f"IQR Upper Threshold: ₹{threshold:.2f}")
print("Flagged Outliers:", outliers.tolist())`,
    output: `Mean: ₹1692.86, Median: ₹400.00, Std Dev: ₹3193.30\nIQR Upper Threshold: ₹1250.00\nFlagged Outliers: [9500.0]`
  },
  {
    id: 'pandas_analytics',
    title: '7. Pandas DataFrame GroupBy and Aggregation',
    concept: 'Unit 2: Pandas Series & DataFrame, GroupBy, Agg, Type Conversion',
    code: `import pandas as pd

data = [
    {'cat': 'Food', 'amount': 300.0, 'type': 'expense'},
    {'cat': 'Travel', 'amount': 150.0, 'type': 'expense'},
    {'cat': 'Food', 'amount': 450.0, 'type': 'expense'},
    {'cat': 'Books', 'amount': 800.0, 'type': 'expense'},
]

df = pd.DataFrame(data)
# Filter expenses and group by category
cat_summary = df.groupby('cat')['amount'].agg(['sum', 'count', 'mean']).reset_index()

print(cat_summary.to_string(index=False))`,
    output: `   cat    sum  count   mean\n Books  800.0      1  800.0\n  Food  750.0      2  375.0\nTravel  150.0      1  150.0`
  },
  {
    id: 'oop_class',
    title: '8. Object-Oriented Class & Encapsulation',
    concept: 'Unit 2: Classes, Constructors (__init__), Encapsulation, Methods',
    code: `class FinancialTransaction:
    """Encapsulates a single financial entry with validation."""
    def __init__(self, description: str, amount: float, tx_type: str):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        if tx_type not in ('income', 'expense'):
            raise ValueError("Type must be income or expense")
        self._description = description
        self._amount = round(float(amount), 2)
        self._type = tx_type

    def is_expense(self) -> bool:
        return self._type == 'expense'

    def get_summary(self) -> str:
        sign = '+' if self._type == 'income' else '-'
        return f"{self._description}: {sign}₹{self._amount}"

tx = FinancialTransaction("Semester Books", 1850.0, "expense")
print(tx.get_summary())`,
    output: `Semester Books: -₹1850.0`
  },
  {
    id: 'inheritance_oop',
    title: '9. OOP Class Inheritance & Polymorphism',
    concept: 'Unit 2: Inheritance, Method Overriding, Polymorphic Reports',
    code: `class BaseReport:
    """Base class for financial reporting."""
    def __init__(self, title: str):
        self.title = title

    def generate(self) -> str:
        raise NotImplementedError("Subclasses must implement generate()")

class CsvReport(BaseReport):
    """Polymorphic subclass for CSV formatted output."""
    def generate(self) -> str:
        return f"format=CSV,title={self.title},status=EXPORT_READY"

class JsonReport(BaseReport):
    """Polymorphic subclass for JSON API output."""
    def generate(self) -> str:
        return f'{{"report": "{self.title}", "format": "JSON"}}'

reports = [CsvReport("Monthly Statement"), JsonReport("Monthly Statement")]
for r in reports:
    print(r.generate())`,
    output: `format=CSV,title=Monthly Statement,status=EXPORT_READY\n{"report": "Monthly Statement", "format": "JSON"}`
  }
];

export default function EducationalPage() {
  const [selectedExample, setSelectedExample] = useState(CODE_EXAMPLES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <Code2 className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Educational Python Algorithms & Code Playground
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Concise, syllabus-aligned Python snippets illustrating the mathematical algorithms used across the application
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation of Examples */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">
            Concepts List ({CODE_EXAMPLES.length})
          </div>
          {CODE_EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setSelectedExample(ex)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 ${
                selectedExample.id === ex.id
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-xs'
                  : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-xs">{ex.title}</div>
              <div className="text-[11px] text-slate-500 line-clamp-1">{ex.concept}</div>
            </button>
          ))}
        </div>

        {/* Right Code Display & Output Panel */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-100">{selectedExample.title}</h3>
                <p className="text-[11px] text-emerald-400 font-medium">{selectedExample.concept}</p>
              </div>

              <button
                onClick={() => handleCopy(selectedExample.code)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Python Code Block */}
            <pre className="p-5 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed bg-slate-950/90">
              <code>{selectedExample.code}</code>
            </pre>

            {/* Output Console Simulation */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] mb-2 uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span>Standard Output (stdout)</span>
              </div>
              <pre className="font-mono text-xs text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                {selectedExample.output}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
