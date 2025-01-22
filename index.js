
import express, { response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import registerModel from './models/registerModel.js';
import todoModel from './models/todoModel.js';

const app = express();

app.use((express.json()));
app.use((express.urlencoded({
    extended: true
})))

app.use((cors('*')));

let PORT = 5600;
let DATABASE_URI = 'mongodb+srv://vishnumothukuru:todo-APP@cluster0.ybh0d.mongodb.net/';

mongoose.connect(DATABASE_URI).then(() => {
    app.listen(PORT, () => {
        console.log('Server connected to DB to port:', PORT);
    })
}).catch((error) => {
    console.log('Server error', error)
})


app.post("/register", async (request, response) => {
    try {
        let { firstName, lastName, password, confirmPassword, email, mobile, address, city, dob, gender } = request.body;
        let exists = await registerModel.findOne({ email });
        if (exists) {
            return response.status(400).json({ message: 'user Already exists' })
        }
        else {
            let newUser = new registerModel({
                email,
                firstName, lastName,
                mobile,
                password,
                confirmPassword,
                address, city, dob, gender
            });
            await newUser.save();
            response.status(200).json({ message: 'Registered successfully' })
        }
    } catch (error) {
        response.status(400).json({ message: 'Registration error | Server Low !' })
    }
});

app.post("/login", async (request, response) => {
    try {
        let { email, password } = request.body;
        let existUser = await registerModel.findOne({ email })
        if (!existUser) {
            return response.status(400).json({ message: 'User Not found ! Please register ' })
        }
        else if (existUser.password != password) {
            return response.status(400).json({ message: 'Password is incorrect' })
        }
        else return response.status(200).json({ message: 'Login Successfull', currentUserId : existUser._id })
    }
    catch (error) {
        response.status(500).json({ message: "Server Error, please try after some time" });
    }
})
app.get('/get-todos/:userId', async (request, response) => {
    try {

        const { userId } = request.params;

        const getTodos = await todoModel.find({ userId });

        if (getTodos.length > 0) {
            return response.status(200).json(getTodos);
        } else {
            return response.status(404).json({ message: 'No Data Found for this user' });
        }
    } catch (error) {
        console.error('Error fetching todos:', error);
        return response.status(500).json({ message: "Server Error, please try after some time" });
    }
});

app.post("/post-todo/:userId", async (request, response) => {
    try {
        // Extract userId from params and title from the request body
        const { userId } = request.params;
        const { title } = request.body;

        let userTodos = await todoModel.findOne({ userId });

        if (!userTodos) {
            // Create a new document if no todos exist for this user
            userTodos = new todoModel({
                userId,
                todos: {
                    todo: [{ title, date: new Date() }]
                }
            });
        } else {
            // Append the new todo to the existing todos.todo array
            userTodos.todos.todo.push({ title, date: new Date() });
        }

        // Save the document
        await userTodos.save();
        return response.status(200).json(userTodos);

    } catch (error) {
        response.status(500).json({ message: "Server Error, please try again later" });
    }
});

app.put("/edit-todo/:userId/:todoId/:status?", async (request, response) => {
    try {
        const { userId, todoId, status } = request.params; // Extract status from URL params
        const { title } = request.body; // Get title from the request body

        // Prepare update data
        const updateData = {};
        if (title) {
            updateData["todos.todo.$.title"] = title;
        }
        if (status) {
            updateData["todos.todo.$.status"] = status;
        }

        // Find the todo by userId and todoId, then update the title and/or status
        await todoModel.updateOne(
            {
                userId,
                "todos.todo._id": todoId
            },
            {
                $set: updateData
            }
        );
        const getEditedTodos = await todoModel.find({ userId })
        response.status(200).json({ message: "Todo updated successfully", getEditedTodos });
    } catch (error) {
        response.status(500).json({ message: "Server error, please try again later" });
    }
});


app.delete("/delete-todo/:userId/:todoId", async (request, response) => {
    try {
        const { userId, todoId } = request.params;

        // Find the user and pull the specific todo from the todos array using todoId
        await todoModel.updateOne(
            {
                userId,
                "todos.todo._id": todoId
            },
            {
                $pull: {
                    "todos.todo": { _id: todoId }
                }
            }
        );
        const getUpadtedTodos = await todoModel.find({ userId })
        response.status(200).json({ message: "Todo deleted successfully", getUpadtedTodos });
    } catch (error) {
        response.status(500).json({ message: "Server error, please try again later" });
    }
});

app.get("/get-current-user/:userId", async (request, response) => {
    try {
        const { userId } = request.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return response.status(400).json({ message: "Invalid user ID" });
        }

        const currentUser = await registerModel.findById(userId);
        if (currentUser) {
            response.status(200).json({ user : currentUser})
        }
    }
    catch (error) {
        response.status(400).json({ message: "user Not Found" });
    }
})

app.get("/todos/completed/:userId", async (request, response) => {
    try {
        const { userId } = request.params;

        // Fetch only completed todos for the user
        const allTodos = await todoModel.find({ userId});
        const completedTodos = allTodos[0].todos.todo.filter((todo) => todo.status === "Completed");
        response.status(200).json({ message: "Completed todos fetched successfully", completedTodos });
    } catch (error) {
        response.status(500).json({ message: "Server error, please try again later" });
    }
});


app.get("/todos/pending/:userId", async (request, response) => {
    try {
        const { userId } = request.params;

        // Fetch only completed todos for the user
        const allTodos = await todoModel.find({ userId });
        const pendingTodos = allTodos[0].todos.todo.filter((todo) => todo.status === "Active");
        response.status(200).json({ message: "Completed todos fetched successfully", pendingTodos });
    } catch (error) {
        response.status(500).json({ message: "Server error, please try again later" });
    }
});

app.delete("/deleteUser/:id", async (request, response) => {
    try {
        const { id } = request.params; // Get the ID from the URL parameters
        let user = await registerModel.findById(id);
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }
        await registerModel.findByIdAndDelete(id);
        response.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        response.status(500).json({ message: "Error deleting user | Server issue!" });
    }
});
