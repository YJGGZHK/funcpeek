/**
 * Manual Test Scenarios for FuncPeek
 *
 * Open this file and manually test each scenario below
 */

// TEST 1: Select only function name "calculateSum"
function calculateSum(a: number, b: number): number {
    return a + b;
}
const sum = calculateSum(10, 20);

// TEST 2: Select class name "TaskManager"
class TaskManager {
    addTask(title: string): void {
        console.log(title);
    }
}
const manager = new TaskManager();
manager.addTask("Test");

// TEST 3: Select variable name "API_URL"
const API_URL = "https://api.example.com";
console.log(API_URL);

// TEST 4: Place cursor on "formatDate" without selecting
function formatDate(date: Date): string {
    return date.toISOString();
}
const today = formatDate(new Date());

// TEST 5: Arrow function "multiply"
const multiply = (x: number, y: number): number => x * y;
const result = multiply(5, 3);

// CHECKLIST:
// ✓ Function name selection works
// ✓ Class name selection works
// ✓ Variable selection works
// ✓ Cursor position detection works
// ✓ Arrow functions work
// ✓ Webview opens
// ✓ Copy button works
// ✓ AI config button shows when not configured
// ✓ Responsive layout works
