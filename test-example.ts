// Test file for FuncPeek extension

class UserManager {
    private users: User[] = [];

    // Test: Select just "addUser" to see if it works
    public addUser(name: string, email: string): User {
        const user: User = {
            id: this.users.length + 1,
            name,
            email
        };
        this.users.push(user);
        return user;
    }

    // Test: Select just "getUserById"
    public getUserById(id: number): User | undefined {
        return this.users.find(u => u.id === id);
    }

    // Test: Select the class name "UserManager"
    public getUsers(): User[] {
        return this.users;
    }
}

interface User {
    id: number;
    name: string;
    email: string;
}

// Test: Select just "calculateTotal"
function calculateTotal(items: number[]): number {
    return items.reduce((sum, item) => sum + item, 0);
}

// Test: Select variable name "apiUrl"
const apiUrl = "https://api.example.com";

// Usage examples
const manager = new UserManager();
const user1 = manager.addUser("Alice", "alice@example.com");
const user2 = manager.addUser("Bob", "bob@example.com");

const foundUser = manager.getUserById(1);
const total = calculateTotal([1, 2, 3, 4, 5]);

console.log(apiUrl);
