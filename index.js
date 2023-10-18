require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");
const router = require("./routes/index");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middleware/error-middleware");
const fileUpload = require("express-fileupload");
const path = require("path");

app.use(fileUpload({}));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "static")));
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use(cookieParser());
app.use("/api", router);
app.use(errorMiddleware);

const start = async() => {
    try {
        await mongoose.connect(process.env.DB_URL);

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        })
    } catch (e) {
        console.log(e);
    }
}

start();