const express=require("express");
const fs=require('fs');
const mongoose=require('mongoose');
const { connect } = require("http2");

const app=express();
const PORT=8000;

// connecting mongoose
mongoose.connect('mongodb://127.0.0.1:27017/project-01')
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log("Error: ",err))

// Schema
const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    jobTitle:{
        type:String,
    },
    gender:{
        type:String,
    },
},
{timestamps:true} //created at, updates at
);

const User=mongoose.model("user",userSchema);

// Middleware - Plugin 
app.use(express.urlencoded({extended:false}));

app.use((res,req,next)=>{
    console.log("Hello from middleware");
    next();
})


// routes
app.get('/users',async(req,res)=>{
    const allDbUsers=await User.find({});
    console.log(allDbUsers);
    
    const html=`
    <ul>
        ${allDbUsers.map((user)=>`<li>${user.firstName}-${user.email}</li>`).join("")}
    </ul>
    `;
    res.send(html);
})

app.get('/api/users',async(req,res)=>{
    const allDbUsers=await User.find({});

    // response headers
    res.setHeader("X-myName","Shivam Kumar"); // custom header (always add X- to custom header)
    console.log(req.headers);
    // JSON format
    return res.json(allDbUsers);
})

app.get('/api/users/:id',async(req,res)=>{
    const user=await User.findById(req.params.id);
    if(!user) return res.status(404).json({error:"User not found!"})
    return res.json(user);
})

app.post('/api/users',async(req,res)=>{
    const body=req.body;
    if(!body||!body.first_name||!body.last_name||!body.email||!body.gender||!body.job_title){
        return res.status(400).json({msg:'All fields are required'})
    }
    
    const result=await User.create({
        firstName:body.first_name,
        lastName:body.last_name,
        email:body.email,
        gender:body.gender,
        jobTitle:body.job_title,
    });
    return res.status(201).json({msg:"Sucess"});
});

app.patch('/api/users/:id',async(req,res)=>{
    await User.findByIdAndUpdate(req.params.id,{lastName:"Changed"});
    return res.json({status:"Sucess"});
});

app.delete('/api/users/:id',async(req,res)=>{
    await User.findByIdAndDelete(req.params.id)
    return res.json({status:"Success"});
});

app.listen(PORT,()=>console.log(`Server started at port:${PORT}`))