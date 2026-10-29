import React from 'react';
import {
  BookOpen,
  Code,
  CheckCircle,
  FileCode,
  Terminal,
  Cpu,
  Database,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function ProjectDocsPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl border border-emerald-900/50">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Academic Syllabus Alignment</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Python Programming & Data Analytics Syllabus Mapping
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
          Comprehensive Viva & Academic Guide demonstrating how the Smart Expense & Budget Analytics System implements each unit of the MCA Python curriculum.
        </p>
      </div>

      {/* Chapter 1.1 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
            1.1
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">Chapter 1.1 — Introduction to Python Core Foundations</h2>
            <p className="text-xs text-slate-500">Variables, identifiers, primitive types, operators, scope, indentation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <h3 className="font-bold text-slate-900 mb-1">Identifiers & Data Types</h3>
            <p className="text-slate-600 leading-relaxed">
              Implemented in <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">backend/app/models/transaction.py</code>:
              integer IDs (<code className="text-slate-800">int</code>), 2-decimal monetary values (<code className="text-slate-800">float</code>),
              text descriptions (<code className="text-slate-800">str</code>), and Boolean sample flags (<code className="text-slate-800">bool</code>).
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <h3 className="font-bold text-slate-900 mb-1">Arithmetic & Comparison Operators</h3>
            <p className="text-slate-600 leading-relaxed">
              Implemented in <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">backend/app/services/financial_calculations.py</code>:
              <code className="text-slate-800">Net Savings = Total Income - Total Expenses</code>,
              <code className="text-slate-800">Savings Rate = (Net Savings / Total Income) * 100</code>,
              comparisons for deficit checks (<code className="text-slate-800">income &lt;= 0</code>).
            </p>
          </div>
        </div>
      </div>

      {/* Chapter 1.2 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
            1.2
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">Chapter 1.2 — Conditional Statements and Iteration</h2>
            <p className="text-xs text-slate-500">if-elif-else branching, loops, break, continue, dictionary dispatch</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <h3 className="font-bold text-slate-900 mb-1">Conditionals & Guards</h3>
            <p className="text-slate-600 leading-relaxed">
              In <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded">backend/app/services/insight_engine.py</code>:
              Nested <code className="text-slate-800">if-elif-else</code> evaluate whether budget consumption &ge; 100% (danger),
              &ge; 80% (warning), or healthy, with ZeroDivisionError guards.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <h3 className="font-bold text-slate-900 mb-1">Loops & Dictionary Dispatch</h3>
            <p className="text-slate-600 leading-relaxed">
              Loops iterate through transactions in <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded">seed_data.py</code> with
              <code className="text-slate-800">continue</code> on invalid types. Python lacks traditional C switch-case, so dictionary dispatch is used in chart routers.
            </p>
          </div>
        </div>
      </div>

      {/* Chapter 1.3 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs">
            1.3
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">Chapter 1.3 — Python Sequences & Data Structures</h2>
            <p className="text-xs text-slate-500">Lists, Tuples, Dictionaries, Sets, and List Comprehensions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <h3 className="font-bold text-slate-900 mb-1">Lists, Tuples & Dictionaries</h3>
            <p className="text-slate-600 leading-relaxed">
              Lists store records; Dictionaries represent JSON API payloads; Tuples encapsulate immutable date bounds
              (<code className="text-slate-800">calendar.monthrange(year, month)</code> returns <code className="text-slate-800">(weekday, days)</code> tuple).
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <h3 className="font-bold text-slate-900 mb-1">List Comprehensions & Sets</h3>
            <p className="text-slate-600 leading-relaxed">
              List comprehensions in <code className="text-purple-700 bg-purple-50 px-1 py-0.5 rounded">financial_calculations.py</code> filter
              transactions concicely: <code className="text-slate-800">[t['amount'] for t in txs if t['type'] == 'expense']</code>. Sets verify uniqueness.
            </p>
          </div>
        </div>
      </div>

      {/* Chapter 1.4 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
            1.4
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">Chapter 1.4 — Functions, Lambdas, and Modules</h2>
            <p className="text-xs text-slate-500">Parameters, default arguments, return values, lambdas, module imports</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
          <h3 className="font-bold text-slate-900 mb-1">Pure Functions & Lambdas</h3>
          <p className="text-slate-600 leading-relaxed">
            All calculations in <code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded">financial_calculations.py</code> are pure functions without side-effects.
            Lambda functions are used for sorting: <code className="text-slate-800">results.sort(key=lambda x: x['total_amount'], reverse=True)</code> and for SQLAlchemy timestamp defaults:
            <code className="text-slate-800">default=lambda: datetime.now(timezone.utc)</code>.
          </p>
        </div>
      </div>

      {/* Unit 2: OOP & Data Analytics */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs">
            Unit 2
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">Unit 2 — Object-Oriented Programming & Data Analytics</h2>
            <p className="text-xs text-slate-500">Classes, Encapsulation, NumPy ndarrays, Pandas DataFrames, Matplotlib & Seaborn</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <h3 className="font-bold text-slate-900 mb-1">OOP & Encapsulation</h3>
            <p className="text-slate-600 leading-relaxed">
              Classes <code className="text-slate-800">Transaction</code>, <code className="text-slate-800">Category</code>, and <code className="text-slate-800">Budget</code> inherit from <code className="text-slate-800">db.Model</code>.
              Business logic is encapsulated in <code className="text-rose-700 bg-rose-50 px-1 py-0.5 rounded">AnalyticsService</code>, <code className="text-rose-700 bg-rose-50 px-1 py-0.5 rounded">InsightEngine</code>, and <code className="text-rose-700 bg-rose-50 px-1 py-0.5 rounded">ChartService</code>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <h3 className="font-bold text-slate-900 mb-1">NumPy & Pandas Analytics</h3>
            <p className="text-slate-600 leading-relaxed">
              Pandas DataFrames handle grouping, pivoting (<code className="text-slate-800">pivot_table</code>), and date parsing.
              NumPy arrays calculate statistical moments: <code className="text-slate-800">np.mean</code>, <code className="text-slate-800">np.median</code>,
              <code className="text-slate-800">np.std</code>, and IQR outlier detection (<code className="text-slate-800">np.percentile(amounts, [25, 75])</code>).
            </p>
          </div>
        </div>
      </div>

      {/* Unit 3: GUI Architecture Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
            Unit 3
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">Unit 3 — GUI Programming Paradigm: Web vs. Desktop (Tkinter)</h2>
            <p className="text-xs text-slate-500">Event handling, form inputs, component state vs desktop GUI event loop</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed space-y-2">
          <p>
            In modern data science engineering, web-based graphical user interfaces (React + REST API) supersede legacy desktop GUI toolkits like Tkinter because:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>State Management:</strong> React hooks (<code className="text-slate-800">useState</code>, <code className="text-slate-800">useEffect</code>) manage graphical state reactively compared to Tkinter's procedural <code className="text-slate-800">mainloop()</code>.</li>
            <li><strong>Responsive Visualizations:</strong> Recharts and SVG render smoothly across screens, while Tkinter Canvas requires manual geometry management.</li>
            <li><strong>Separation of Concerns:</strong> Client handles presentation while Flask handles Python computations independently.</li>
          </ul>
        </div>
      </div>

      {/* Python REPL Practical Viva Commands */}
      <div className="bg-slate-950 text-slate-200 rounded-2xl p-6 shadow-lg border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Terminal className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Viva Demonstration: Python REPL Commands</h3>
        </div>
        <p className="text-xs text-slate-400">
          You can test and demonstrate these exact functions directly from the interactive Python REPL terminal:
        </p>

        <div className="p-4 bg-slate-900 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto space-y-1">
          <div><span className="text-slate-500">&gt;&gt;&gt;</span> from backend.app import create_app</div>
          <div><span className="text-slate-500">&gt;&gt;&gt;</span> from backend.app.models.transaction import Transaction</div>
          <div><span className="text-slate-500">&gt;&gt;&gt;</span> from backend.app.services.analytics_service import AnalyticsService</div>
          <div><span className="text-slate-500">&gt;&gt;&gt;</span> app = create_app()</div>
          <div><span className="text-slate-500">&gt;&gt;&gt;</span> with app.app_context():</div>
          <div><span className="text-slate-500">&gt;&gt;&gt;</span> &nbsp;&nbsp;&nbsp;&nbsp;txs = Transaction.query.all()</div>
          <div><span className="text-slate-500">&gt;&gt;&gt;</span> &nbsp;&nbsp;&nbsp;&nbsp;stats = AnalyticsService.get_expense_statistics(txs)</div>
          <div><span className="text-slate-500">&gt;&gt;&gt;</span> &nbsp;&nbsp;&nbsp;&nbsp;print(stats['mean'], stats['median'], stats['std_dev'])</div>
        </div>
      </div>
    </div>
  );
}
