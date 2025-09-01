# 🎓 Student Performance Calculator

A simple web application to calculate student performance.  
Built with **HTML, CSS, JavaScript (frontend)**, **PHP (backend)**, and **MySQL (database)**.  

---

## 🚀 Features
- Add student details with multiple subject marks  
- Calculate total, average, and grade automatically  
- Store student records in MySQL database  
- Simple, clean, and responsive UI  

---

## 🛠️ Tech Stack
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** PHP  
- **Database:** MySQL  

---

## 📂 Project Structure
```
student-performance-calculator/
│── index.html       # Main page - Add student marks
│── style.css        # Styling
│── script.js        # Frontend logic
│── db.sql           # Database schema
│── config.php       # Database connection
```

---

## ⚙️ Installation & Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/student-performance-calculator.git
   cd student-performance-calculator
   ```

2. Import the database:
   - Open **phpMyAdmin** → Create a new database `studentdb`  
   - Import `db.sql` file  

   OR use CLI:
   ```bash
   mysql -u root -p < db.sql
   ```

3. Update database credentials in `config.php` if needed:
   ```php
   $servername = "localhost";
   $username = "root";
   $password = "";
   $dbname = "studentdb";
   ```

4. Start your local server (XAMPP / WAMP / LAMP).  
   Place this project in the `htdocs` (or www) folder.  

5. Open in browser:
   ```
   http://localhost/student-performance-calculator
   ```

---

## 🎯 Usage
- Enter student details and marks in the form  
- Submit → The app will calculate **total, average, and grade**  
- Record is stored in the database  

---

## 📸 Screenshots
(Add screenshots of your UI here)

---

## 🤝 Contributing
Contributions are welcome!  
1. Fork the repo  
2. Create a new branch  
3. Make changes and commit  
4. Submit a pull request  

---

## 📜 License
This project is licensed under the MIT License.
