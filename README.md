# Smart Expense & Budget Analytics System

[![Python](https://img.shields.io/badge/Python-3.14%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Backend-Flask%203.1-green.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61dafb.svg)](https://react.dev/)
[![NumPy](https://img.shields.io/badge/Analytics-NumPy%20%26%20Pandas-orange.svg)](https://numpy.org/)
[![Database](https://img.shields.io/badge/Database-SQLite%203-lightgrey.svg)](https://sqlite.org/)
[![Tests](https://img.shields.io/badge/Tests-Pytest%20Passing-brightgreen.svg)](https://pytest.org/)

A full-stack, data-driven personal financial analytics web application engineered for the **MCA Data Science Python Mini-Project** and academic viva examination.

The system empowers students and individuals to track income, control expenses, manage monthly budget ceilings, and perform actual statistical data analytics using **Python, Pandas, NumPy, Matplotlib, and Seaborn** on a persistent **SQLite** database.

---

## Table of Contents
1. [Project Overview & Key Objectives](#1-project-overview--key-objectives)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema](#4-database-schema)
5. [Python Syllabus Mapping (MCA Curriculum)](#5-python-syllabus-mapping-mca-curriculum)
6. [Prerequisites & System Requirements](#6-prerequisites--system-requirements)
7. [Installation & Setup Instructions (Windows)](#7-installation--setup-instructions-windows)
8. [Running the Application](#8-running-the-application)
9. [Running Automated Tests](#9-running-automated-tests)
10. [REST API Documentation](#10-rest-api-documentation)
11. [Troubleshooting Common Errors](#11-troubleshooting-common-errors)
12. [Known Limitations & Future Enhancements](#12-known-limitations--future-enhancements)

---

## 1. Project Overview & Key Objectives

### Purpose
Help university students and young professionals manage personal finances while demonstrating practical mastery of core Python programming, object-oriented concepts, and statistical data science libraries.

### Primary Objectives
- **Persistent Financial Tracking**: Complete Create, Read, Update, and Delete (CRUD) operations for Income and Expense records.
- **Budget Ceilings & Overrun Detection**: Monthly overall budgets and category-specific expenditure caps with 80% caution alerts and 100% overrun detection.
- **Real NumPy & Pandas Analytics**:
  - Arithmetic Mean, Median, and Standard Deviation (variability).
  - Interquartile Range (IQR) statistical anomaly/outlier detection ($Q_3 + 1.5 \times IQR$).
  - Month-over-Month (MoM) expense and income percentage shifts.
  - Daily spending velocity and projected end-of-month expenditure.
- **Dual Visualizations**:
  - Interactive browser charts via **Recharts** (Donut distributions, grouped bars, line charts).
  - Server-side generated analytical visualizations via **Matplotlib & Seaborn** (KDE distribution histograms, correlation heatmaps).
- **Rule-Based Dynamic Insights**: Real-time financial alerts generated directly from stored transaction patterns.
- **Secure Reporting & CSV Export**: Exporting filtered data with built-in protection against Spreadsheet Formula Injection (CWE-1236).

---

## 2. Technology Stack

### Backend
- **Language**: Python 3.10+ (tested and compatible with Python 3.14)
- **Web Framework**: Flask 3.1 & Flask-CORS
- **ORM / Database**: SQLAlchemy 2.1 & SQLite 3
- **Data Analytics**: Pandas 3.0 & NumPy 2.5
- **Data Visualization**: Matplotlib 3.11 & Seaborn 0.13 (headless `Agg` backend)
- **Testing**: Pytest 9.1 with Flask Test Client

### Frontend
- **Framework**: React 19 with Vite 8 bundler
- **Styling**: Tailwind CSS with custom academic finance palette
- **Icons**: Lucide React
- **Interactive Charts**: Recharts
- **API Client**: Axios

---

## 3. System Architecture

```
[ React 19 + Vite Single Page Application ]
                  |
         HTTP REST API (JSON)
                  v
[ Flask 3.1 Application Controller / Blueprints ]
    |                    |                    |
[ SQLAlchemy ORM ]  [ Pandas / NumPy ]  [ Matplotlib / Seaborn ]
    |               (Statistical EDA)   (Server-Side Charts)
    v
[ SQLite 3 Database (smart_expense.db) ]
```

---

## 4. Database Schema

The database consists of relational models in SQLite:

### Categories (`categories`)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key | Unique category ID |
| `name` | String(64) | Unique, Not Null | Category title (e.g. Food, Rent) |
| `type` | String(16) | Not Null | `expense`, `income`, or `both` |
| `icon` | String(32) | Default 'tag' | Lucide icon identifier |
| `color` | String(16) | Hex code | Visual accent color token |
| `is_default` | Boolean | Default False | System seed category flag |
| `created_at` | DateTime | Timestamp | Category creation date |

### Transactions (`transactions`)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key | Unique transaction ID |
| `description`| String(255) | Not Null, Indexed | Transaction item title |
| `amount` | Float | Not Null | 2-decimal rounded monetary value |
| `type` | String(16) | Not Null, Indexed | `income` or `expense` |
| `category_id`| Integer | Foreign Key (`categories.id`) | Relational category mapping |
| `date` | Date | Not Null, Indexed | Transaction transaction date |
| `payment_method`| String(32)| Not Null | UPI, Cash, Card, Net Banking |
| `notes` | Text | Nullable | User optional context |
| `is_sample` | Boolean | Default False, Indexed | Isolated demo record flag |
| `created_at` | DateTime | Timestamp | System timestamp |
| `updated_at` | DateTime | Timestamp | Auto-update timestamp |

### Budgets (`budgets`)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key | Unique budget ID |
| `month_year` | String(7) | Not Null, Indexed | Target month (format: `YYYY-MM`) |
| `category_id`| Integer | Foreign Key (`categories.id`), Nullable | Specific category or Overall (Null) |
| `amount` | Float | Not Null | Budget ceiling cap |
| `created_at` | DateTime | Timestamp | Budget creation date |

*Constraint: Composite Unique on `(month_year, category_id)` prevents duplicate budgets.*

---

## 5. Python Syllabus Mapping (MCA Curriculum)

| Syllabus Unit | Concept | Concrete Implementation in Project |
|---|---|---|
| **Chapter 1.1** | Identifiers, Types & Operators | `int` IDs, `float` monetary sums, `str` notes, `bool` sample flags. Net savings arithmetic: `Income - Expense`. |
| **Chapter 1.2** | Conditionals & Iteration | `if-elif-else` guards in `insight_engine.py`. ZeroDivisionError guard when `Income == 0`. Loop control with `continue`. |
| **Chapter 1.3** | Python Sequences | Lists for record sets; Tuples for date ranges (`calendar.monthrange`); Dictionaries for JSON API serialization; List comprehensions for filtering. |
| **Chapter 1.4** | Functions & Lambdas | Pure calculations in `financial_calculations.py`. Anonymous lambdas for multi-field sorting: `sorted(cats, key=lambda c: c['amount'])`. |
| **Unit 2 (OOP)**| Classes & Encapsulation | SQLAlchemy ORM model classes (`Transaction`, `Category`, `Budget`). Service encapsulation in `AnalyticsService` and `ChartService`. |
| **Unit 2 (Data Analytics)** | NumPy & Pandas EDA | Pandas DataFrames (`groupby`, `pivot_table`, date resampling). NumPy arrays for `np.mean`, `np.median`, `np.std`, and IQR outlier rule. |
| **Unit 2 (Visualization)**| Matplotlib & Seaborn | Server-side figure rendering (`matplotlib.use('Agg')`), KDE histograms, Seaborn heatmaps converted to base64 PNG data URLs. |
| **Unit 3 (GUI)**| Web GUI Architecture | Modern React event-driven component state compared to procedural desktop Tkinter main loops. |

---

## 6. Prerequisites & System Requirements

- **Operating System**: Windows 10/11, macOS, or Linux
- **Python**: Version 3.10, 3.11, 3.12, 3.13, or 3.14
- **Node.js**: Version 18.x, 20.x, 22.x, or 24.x (with npm)

---

## 7. Installation & Setup Instructions (Windows)

### Step 1: Open PowerShell or Command Prompt
Navigate to the project root directory:
```powershell
cd "c:\Users\yuvra\OneDrive\Attachments\Desktop\python project"
```

### Step 2: Install Backend Dependencies
Install Python requirements using pip:
```powershell
python -m pip install -r backend/requirements.txt
```

### Step 3: Install Frontend Dependencies
```powershell
cd frontend
npm.cmd install
cd ..
```

---

## 8. Running the Application

### Start the Backend API Server
In your first terminal window, start Flask on port 5000:
```powershell
python backend/run.py
```
*The backend API will start at: `http://127.0.0.1:5000`*

### Start the Frontend Web Application
In a second terminal window, run Vite dev server:
```powershell
cd frontend
npm.cmd run dev
```
*The React UI will start at: `http://localhost:3000`*

Open **`http://localhost:3000`** in Google Chrome or any modern browser.

---

## 9. Running Automated Tests

Run the full automated test suite using Pytest:
```powershell
python -m pytest backend/tests -v
```

All 16 unit, analytics, and integration tests verify:
- Transaction CRUD and database persistence
- Net savings and zero-division savings rate safety
- Category aggregations and Month-over-Month shifts
- NumPy moments and IQR outlier rule
- Duplicate budget prevention
- CSV formula injection protection (`CWE-1236`)

---

## 10. REST API Documentation

### Health Check
- `GET /api/health`: Returns API health and version status.

### Transactions
- `GET /api/transactions`: Query transactions with filters (`type`, `category_id`, `search`, `start_date`, `end_date`, `page`, `per_page`, `sort_by`).
- `POST /api/transactions`: Create new income or expense transaction.
- `GET /api/transactions/<id>`: Retrieve single transaction.
- `PUT /api/transactions/<id>`: Update transaction details.
- `DELETE /api/transactions/<id>`: Delete transaction and recalculate totals.

### Categories
- `GET /api/categories`: Retrieve all categories with transaction counts.
- `POST /api/categories`: Add custom category.
- `PUT /api/categories/<id>`: Rename or update category style.
- `DELETE /api/categories/<id>`: Delete category (protects referential integrity by requiring reassignment if transactions exist).

### Budgets
- `GET /api/budgets?month_year=YYYY-MM`: Retrieve budget limits and real-time utilization percentages.
- `POST /api/budgets`: Create monthly overall or category budget limit.
- `PUT /api/budgets/<id>`: Edit budget ceiling.
- `DELETE /api/budgets/<id>`: Delete budget ceiling.

### Analytics & Reports
- `GET /api/analytics/dashboard?month_year=YYYY-MM`: Complete calculated metrics for dashboard.
- `GET /api/analytics/distribution?month_year=YYYY-MM`: NumPy statistical metrics and IQR outliers.
- `GET /api/analytics/insights?month_year=YYYY-MM`: Dynamic rule-based insight items.
- `GET /api/analytics/charts/matplotlib?type=histogram|donut|bar|heatmap`: Matplotlib/Seaborn server-generated base64 PNG charts.
- `GET /api/reports/transactions.csv`: Formula-injection sanitized transaction CSV export.
- `GET /api/reports/summary.csv`: Monthly financial summary CSV export.

### Demo / Settings
- `POST /api/demo/seed`: Inserts 23+ realistic demonstration records (`is_sample=True`).
- `POST /api/demo/clear`: Safely deletes only demonstration records without touching user records.
- `POST /api/demo/reset-all`: Complete database reset and re-seed.

---

## 11. Troubleshooting Common Errors

### 1. PowerShell Script Execution Policy Error (`npm : File npm.ps1 cannot be loaded`)
**Cause**: Windows PowerShell security policy disables unsigned scripts by default.  
**Fix**: Use `npm.cmd` instead of `npm`:
```powershell
npm.cmd run dev
```

### 2. Port 5000 Already in Use
**Cause**: An earlier Flask or Python process is still running.  
**Fix**: Terminate the existing process in PowerShell:
```powershell
Get-Process python | Stop-Process -Force
python backend/run.py
```

### 3. Matplotlib GUI Window Warning on Headless Server
**Fix**: Handled automatically. The backend explicitly configures `matplotlib.use('Agg')` before importing pyplot, ensuring headless, thread-safe rendering.

---

## 12. Known Limitations & Future Enhancements

- **Single Profile**: Designed for academic mini-project demonstration. Future updates can incorporate multi-user authentication using Flask-JWT-Extended.
- **Automated Bank Sync**: Financial privacy is prioritized—data is stored locally in SQLite without requiring external banking credentials or paid third-party APIs.
- **Machine Learning Forecasting**: ARIMA / Prophet time-series models can be layered over the existing Pandas data structures for multi-month predictive budgeting.
