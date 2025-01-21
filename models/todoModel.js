import mongoose from "mongoose";

const todoSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "registerModel",       // Reference to the model
        required: true
    },
    todos: {
        todo: [
          {
            title: {
              type: String,
              required: true
            },
            status: {
              type: String,
              required: true,
              default: "Active"
            },
            date: {
              type: Date,
              required: true,
              default: Date.now
            }
          }
        ]
      }
})

const todoModel = mongoose.model("Todo", todoSchema);
export default todoModel