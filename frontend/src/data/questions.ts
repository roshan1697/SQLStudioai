export const SQL_QUESTIONS = [
    {
        id: 1,
        title: "Find Duplicate Emails",
        difficulty: "easy",
        category: "Aggregation",
        description: "Write a SQL query to find all duplicate email addresses in the Person table.",
        schema: `-- Table: Person
-- +----+---------+
-- | id | email   |
-- +----+---------+
-- | 1  | a@b.com |
-- | 2  | c@d.com |
-- | 3  | a@b.com |
-- +----+---------+`,
        starterCode: `-- Find all duplicate email addresses
SELECT email
FROM Person
GROUP BY email
HAVING COUNT(email) > 1;`,
        expectedOutput: `+----------+
| email    |
+----------+
| a@b.com  |
+----------+`,
        tags: ["GROUP BY", "HAVING", "COUNT"],
    },
    {
        id: 2,
        title: "Second Highest Salary",
        difficulty: "medium",
        category: "Subqueries",
        description: "Write a SQL query to get the second highest salary from the Employee table. Return null if there is no second highest salary.",
        schema: `-- Table: Employee
-- +----+--------+
-- | id | salary |
-- +----+--------+
-- | 1  | 100    |
-- | 2  | 200    |
-- | 3  | 300    |
-- +----+--------+`,
        starterCode: `-- Get the second highest salary
SELECT MAX(salary) AS SecondHighestSalary
FROM Employee
WHERE salary < (
  SELECT MAX(salary)
  FROM Employee
);`,
        expectedOutput: `+---------------------+
| SecondHighestSalary |
+---------------------+
| 200                 |
+---------------------+`,
        tags: ["Subquery", "MAX", "NULL"],
    },
    {
        id: 3,
        title: "Employees Earning More Than Manager",
        difficulty: "medium",
        category: "Self Join",
        description: "Find all employees who earn more than their manager using a self-join on the Employee table.",
        schema: `-- Table: Employee
-- +----+-------+--------+-----------+
-- | id | name  | salary | managerId |
-- +----+-------+--------+-----------+
-- | 1  | Joe   | 70000  | 3         |
-- | 2  | Henry | 80000  | 4         |
-- | 3  | Sam   | 60000  | NULL      |
-- | 4  | Max   | 90000  | NULL      |
-- +----+-------+--------+-----------+`,
        starterCode: `-- Find employees earning more than their manager
SELECT e.name AS Employee
FROM Employee e
JOIN Employee m ON e.managerId = m.id
WHERE e.salary > m.salary;`,
        expectedOutput: `+----------+
| Employee |
+----------+
| Joe      |
+----------+`,
        tags: ["Self JOIN", "WHERE", "Alias"],
    },
    {
        id: 4,
        title: "Customers Who Never Order",
        difficulty: "easy",
        category: "Joins",
        description: "Find all customers who have never placed an order using a LEFT JOIN or NOT IN subquery.",
        schema: `-- Customers: id, name
-- Orders: id, customerId`,
        starterCode: `-- Find customers with no orders
SELECT c.name AS Customers
FROM Customers c
LEFT JOIN Orders o ON c.id = o.customerId
WHERE o.id IS NULL;`,
        expectedOutput: `+-----------+
| Customers |
+-----------+
| Henry     |
| Max       |
+-----------+`,
        tags: ["LEFT JOIN", "NULL", "NOT IN"],
    },
    {
        id: 5,
        title: "Department Top Three Salaries",
        difficulty: "hard",
        category: "Window Functions",
        description: "Find employees who have the top three unique salaries in each department using window functions.",
        schema: `-- Employee: id, name, salary, departmentId
-- Department: id, name`,
        starterCode: `-- Top 3 salaries per department using DENSE_RANK
SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary
FROM Employee e
JOIN Department d ON e.departmentId = d.id
WHERE (
  SELECT COUNT(DISTINCT e2.salary)
  FROM Employee e2
  WHERE e2.departmentId = e.departmentId
    AND e2.salary >= e.salary
) <= 3
ORDER BY d.name, e.salary DESC;`,
        expectedOutput: `+------------+----------+--------+
| Department | Employee | Salary |
+------------+----------+--------+
| IT         | Max      | 90000  |
| IT         | Joe      | 85000  |
| Sales      | Henry    | 80000  |
+------------+----------+--------+`,
        tags: ["DENSE_RANK", "Subquery", "JOIN"],
    },
    {
        id: 6,
        title: "Consecutive Numbers",
        difficulty: "medium",
        category: "Window Functions",
        description: "Find all numbers that appear at least three times consecutively in the Logs table.",
        schema: `-- Table: Logs
-- +----+-----+
-- | id | num |
-- +----+-----+
-- | 1  | 1   |
-- | 2  | 1   |
-- | 3  | 1   |
-- | 4  | 2   |
-- | 5  | 1   |
-- | 6  | 2   |
-- | 7  | 2   |
-- +----+-----+`,
        starterCode: `-- Find numbers appearing at least 3 times consecutively
SELECT DISTINCT l1.num AS ConsecutiveNums
FROM Logs l1
JOIN Logs l2 ON l2.id = l1.id + 1 AND l2.num = l1.num
JOIN Logs l3 ON l3.id = l1.id + 2 AND l3.num = l1.num;`,
        expectedOutput: `+-----------------+
| ConsecutiveNums |
+-----------------+
| 1               |
+-----------------+`,
        tags: ["Self JOIN", "DISTINCT", "Sequential"],
    },
    {
        id: 7,
        title: "Rising Temperature",
        difficulty: "easy",
        category: "Date Functions",
        description: "Find all dates where the temperature was higher than the previous day's temperature.",
        schema: `-- Table: Weather
-- +----+------------+-------------+
-- | id | recordDate | temperature |
-- +----+------------+-------------+`,
        starterCode: `-- Find days warmer than the previous day
SELECT w1.id
FROM Weather w1
JOIN Weather w2 
  ON DATEDIFF(w1.recordDate, w2.recordDate) = 1
WHERE w1.temperature > w2.temperature;`,
        expectedOutput: `+----+
| id |
+----+
| 2  |
| 4  |
+----+`,
        tags: ["DATEDIFF", "Self JOIN", "Date"],
    },
    {
        id: 8,
        title: "Rank Scores",
        difficulty: "medium",
        category: "Window Functions",
        description: "Write a solution to find the rank of the scores. The ranking should be calculated according to the following rules — no gaps in ranking numbers.",
        schema: `-- Table: Scores
-- +----+-------+
-- | id | score |
-- +----+-------+
-- | 1  | 3.50  |
-- | 2  | 3.65  |
-- | 3  | 4.00  |
-- | 4  | 3.85  |
-- | 5  | 4.00  |
-- | 6  | 3.65  |
-- +----+-------+`,
        starterCode: `-- Rank scores using DENSE_RANK
SELECT score,
  DENSE_RANK() OVER (ORDER BY score DESC) AS \`rank\`
FROM Scores
ORDER BY score DESC;`,
        expectedOutput: `+-------+------+
| score | rank |
+-------+------+
| 4.00  | 1    |
| 4.00  | 1    |
| 3.85  | 2    |
| 3.65  | 3    |
+-------+------+`,
        tags: ["DENSE_RANK", "OVER", "ORDER BY"],
    },
    {
        id: 9,
        title: "Department Highest Salary",
        difficulty: "medium",
        category: "Aggregation",
        description: "Find employees who have the highest salary in each department.",
        schema: `-- Employee: id, name, salary, departmentId
-- Department: id, name`,
        starterCode: `-- Highest salary per department
SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary
FROM Employee e
JOIN Department d ON e.departmentId = d.id
WHERE (d.id, e.salary) IN (
  SELECT departmentId, MAX(salary)
  FROM Employee
  GROUP BY departmentId
);`,
        expectedOutput: `+------------+----------+--------+
| Department | Employee | Salary |
+------------+----------+--------+
| IT         | Max      | 90000  |
| Sales      | Henry    | 80000  |
+------------+----------+--------+`,
        tags: ["JOIN", "MAX", "Subquery"],
    },
    {
        id: 10,
        title: "Delete Duplicate Emails",
        difficulty: "easy",
        category: "DML",
        description: "Write a DELETE statement to remove all duplicate emails, keeping only the row with the smallest id.",
        schema: `-- Table: Person
-- +----+---------+
-- | id | email   |
-- +----+---------+
-- | 1  | a@b.com |
-- | 2  | c@d.com |
-- | 3  | a@b.com |
-- +----+---------+`,
        starterCode: `-- Delete duplicates keeping lowest id
DELETE p1
FROM Person p1
JOIN Person p2 
  ON p1.email = p2.email 
  AND p1.id > p2.id;`,
        expectedOutput: `+----+---------+
| id | email   |
+----+---------+
| 1  | a@b.com |
| 2  | c@d.com |
+----+---------+`,
        tags: ["DELETE", "Self JOIN", "DML"],
    },
];
