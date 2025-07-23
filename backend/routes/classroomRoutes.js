
const express = require('express');
const Classroom = require('../models/classroomModel');
const User = require('../models/userModel');
const Post = require('../models/postModel');
const FileModel = require('../models/fileModel');
const ClassroomJoin = require('../models/classroomJoinModel');
const responseFunction = require('../utils/responseFunction');
const authTokenHandler = require('../middlewares/checkAuthToken');
const router = express.Router();
const nodemailer = require('nodemailer');
const path = require('path');


// for uploading notes in different formats...

const multer = require("multer");
const fs = require('fs');
const {PDFDocument, rgb} = require('pdf-lib');//pdf 
const mammoth = require('mammoth');//for extracting DOCX
const XLSX = require('xlsx');// for handling excel


// ensure uploads directory exists;
const uploadDir = path.join(__dirname,'uploads');
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

//multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Preserving the original file name
    }
});

const upload = multer({ storage: storage });


//Add notes to PDF

async function addNoteToPDF(filePath, note,newFileName) {
    const existingPdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    firstPage.drawText(note, {
        x: 50,
        y: firstPage.getHeight() - 100,
        size: 14,
        color: rgb(1, 0, 0),
    });

    const modifiedPdfBytes = await pdfDoc.save();

    const newFilePath = newFileName.endsWith('.pdf')? filePath : filePath + '.pdf';
    fs.writeFileSync(newFilePath, modifiedPdfBytes,"binary");
}


//Add notes to word(docx)

async function addNoteToWord(filePath, note) {
    const content = fs.readFileSync(filePath, "utf8");
    const newContent = content + "\n\nNote: " + note;
    fs.writeFileSync(filePath, newContent, "utf8");
}

// Add notes to excel

async function addNoteToExcel(filePath, note) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const lastRow = XLSX.utils.decode_range(sheet["!ref"]).e.r + 1;
    const newRow = `A${lastRow + 1}`;
    sheet[newRow] = { v: `Note: ${note}` };

    XLSX.writeFile(workbook, filePath);
}


const mailer = async (recievermail , code) => {
    let transporter = nodemailer.createTransport({
        host : "smtp.gmail.com",
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
            user:process.env.COMPANY_EMAIL,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    })

    let info = await transporter.sendMail({
        from:"NIT-FORUM",
        to:recievermail,
        subject:"NIT-FORUM OTP Verification",
        text : "Your OTP is" + code,
        html:"<b>Your OTP is"+code+"</b>",
    })

    console.log("Messaage sent: %s",info.messageId);
    if(info.messageId){
        return true;
    }
    else{
        return false;
    }
}

 

router.post('/create',authTokenHandler,async(req,res) => {
    const {name,description} = req.body;
    console.log(name,description,req.body);
    if(!name){
        return responseFunction(res,400,"Name is required",null,false);
    }
    try{
        const  newClassroom = new Classroom({
            name,
            description,
            owner:req.userId,
        })

        await newClassroom.save();
        return responseFunction(res,200,"Classroom created successfully",newClassroom,true);
    }
    catch(err){
        return responseFunction(res,500,"Internal server error",null,false);
    }
})


router.get('/classroomscreatedbyme',authTokenHandler,async(req,res) =>{
    try{
        const classrooms = await Classroom.find({owner:req.userId});

        return responseFunction(res,200,"Classrooms fetched successfully",classrooms,true);
    }
    catch(err){
        return responseFunction(res,500,"Internal server error",null,false);
    }
})

router.get('/getclassbyid/:classid',authTokenHandler,async(req,res)=>{
    const {classid} = req.params; 
    try{
        const classroom = await Classroom.findById(classid).populate('posts');
        if(!classroom){
            return responseFunction(res, 404,'Classroom not found',null,false);
        }
        else{
            return responseFunction(res,200,'Classroom fetches Successfully',classroom,true);
        }

    }
    catch(err){
        return responseFunction(res,500,'Internal server error',err,false);
    }
})

router.post('/addpost',authTokenHandler,async(req,res)=>{
    const {title,description,classId} = req.body;

    try{
        const classroom = await Classroom.findById(classId);
        if(!classroom){
            return res.status(404).json({message:'Classroom not found'});
        }
        
        const newPost = new Post({
            title,
            description,
            classId,
            createdBy : req.userId
        });

        await newPost.save();

        classroom.posts.push(newPost._id);
        await classroom.save();

        res.status(201).json({message : 'Post Created Successfully',post : newPost});

    }
    catch(err){
        res.status(500).json({message:'Server Error',err});
    }
})

router.get('/classrooms/search',async(req,res)=>{
    try{
        const term = req.query.term;
        if(!term){
            return responseFunction(res,400,"Search term is required",null,false);
        }

        const results = await Classroom.find({
            name:{$regex : new RegExp(term,'i')}
        })

        if(results.length === 0){
            return responseFunction(res,400,'Classroom nt found',null,false);
        }
        else{
            return responseFunction(res,200,"Search results",results,true);
        }
    }
    catch(err){
        console.error(err);
        responseFunction(res,500,'Internal server error',err ,false);
    }
})

router.post('/request-to-join',async(req,res)=>{
    const {classroomId, studentEmail} = req.body;

    if(!classroomId || !studentEmail){
        return responseFunction(res,404,'Classroom ID and student email are required',null,false);
    }

    try{

        const classroom = await Classroom.findById(classroomId);
        if(!classroom){
            return responseFunction(res,404,'Classroom not found',null,false);
        }

        const classOwnerId = classroom.owner;

        const classOwner = await User.findById(classOwnerId);
        if(!classOwner){
            return responseFunction(res, 404,'Class owner not found',null,false);
        }

        const classOwnerEmail = classOwner.email; 

        const code = Math.floor(100000 + Math.random() * 900000);
        const isSent = await mailer(classOwnerEmail , code);
        if(!isSent){
            return responseFunction(res, 500 ,'Failed to send OTP',null,false);
        }

        const newClassroomJoin = new ClassroomJoin({
            classroomId,
            studentEmail,
            code,
            classOwnerEmail
        });

        await newClassroomJoin.save();
        return responseFunction(res,200,'OTP sent to the class owner',null,true);
    }
    catch(err){
        console.log(err);
        return responseFunction(res,500,"Internal server error",err,false);
    }

})

// OTP SENT TO - TEACHER & SAVED TO DB COLLECTION - NAMED AS - STUDENT JOIN 

router.post('/verify-otp', authTokenHandler,async(req,res)=>{
    const {classroomId, studentEmail, otp } = req.body;

    if(!classroomId || !studentEmail || !otp){
        return responseFunction(res,400,'Classroom ID , student email and OTP are required',null ,false);
    }
    
    try{
        const joinRequest = await ClassroomJoin.findOne({
            classroomId,
            studentEmail,
            code:otp
        });

        if(!joinRequest){
            return responseFunction(res,400,'Invalid OTP or join request not found',null,false);
        }

        const classroom = await Classroom.findById(classroomId);
        if(!classroom){
            return responseFunction(res,404,'Classroom not found',null,false);
        }

        if(!classroom.students.includes(studentEmail)){
            classroom.students.push(studentEmail);
            await classroom.save();
        }

        await ClassroomJoin.deleteOne({_id: joinRequest._id});

        return responseFunction(res, 200,'Successfully joined the class',null,true);
        
    }
    catch(err){
        return responseFunction(res,500,'Internal server error',err,false);
    }

})


router.get('/classroomsforstudent',authTokenHandler,async(req,res)=>{
    try{
        const user = await User.findById(req.userId);
        if(!user){
            return responseFunction(res, 404,'User not found',null,false);
        }
        const studentEmail = user.email;
        const classrooms = await Classroom.find({students : studentEmail});
        if(classrooms.length === 0){
            return responseFunction(res,404,'No classrooms found for this student',null,false);
        }
        else{
            return responseFunction(res,200,'Classroom fetched successfully',classrooms,true);
        }
    }
    catch(err){
        console.log(err);
        return responseFunction(res,500,'Internal server error',err,false);
    }
})

// router.post('/classes/upload', upload.single('file'),async(req,res)=>{

//     if(!req.file){
//         return res.status(400).json({message : 'No file uploaded'});
//     }
//     const { note } = req.body;
//     const filePath = req.file.path;
//     const fileType = req.file.mimetype;
//     const fileName = req.file.originalname;

//     //console.log(req);

//     try {
//         if (fileType === "application/pdf") {
//             await addNoteToPDF(filePath, note,fileName);
//         } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
//             await addNoteToWord(filePath, note);
//         } else if (fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
//             await addNoteToExcel(filePath, note);
//         } else {
//             return res.status(400).json({ message: "Unsupported file type" });
//         }
        
//         //res.download(filePath);
//         res.json({ message: "File uploaded successfully", fileName });
        
//     } catch (error) {
//         res.status(500).json({ message: "Error processing file", error });
//     }
// })



router.post('/classes/uploads', authTokenHandler, upload.single('file'), async (req, res) => {
    try {
        const userId = req.userId;  // From checkAuth middleware
        const { classId } = req.body;  // coming from formData
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'professor') {
            return res.status(403).json({ message: 'Only professors can upload files' });
        }

        const newFile = new FileModel({
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileContent: req.file.buffer,
            uploadedBy: user._id,
            classId: classId,  // Passed from frontend
        });

        await newFile.save();

        res.status(200).json({ message: 'File uploaded successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});



// router.get("/files/:filename", (req, res) => {
//     const filePath = path.join(__dirname, "../uploads", req.params.filename);
  
//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({ message: "File not found" });
//     }
  
//     const fileExt = path.extname(filePath);
//     const mimeTypes = {
//       ".pdf": "application/pdf",
//       ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     };
  
//     res.setHeader("Content-Type", mimeTypes[fileExt] || "application/octet-stream");
//     res.setHeader("Content-Disposition", `attachment; filename="${req.params.filename}"`);
  
//     res.download(filePath,req.params.filename);
//   });


router.get('/classes/:classId/files', authTokenHandler, async (req, res) => {
    const userId = req.userId;
    const { classid } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Assuming you have Class model with enrolledStudents array
        const classroom = await Class.findById(classid);

        if (!classroom) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // If student, check if enrolled
        if (user.role === 'student' && !classroom.enrolledStudents.includes(user._id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const files = await FileModel.find({ classId });

        res.status(200).json(files);

    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});


// to show files on frontend;

// router.get('/files',(req,res) => {
//     fs.readdir('uploads', (err,files) => {
//         if (err){
//             return res.status(500).send({error : 'Unable to scan directory'});
//         }
//         res.json(files);
//     });
// })

router.get('/classes/:classId/files/:fileId/download',authTokenHandler, async (req, res) => {
    const { fileId } = req.params;

    try {
        const file = await FileModel.findById(fileId);

        if (!file) return res.status(404).json({ message: 'File not found' });

        res.setHeader('Content-Type', file.fileType);
        res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
        res.send(file.fileContent);

    } catch (err) {
        res.status(500).json({ message: 'Download failed', error: err.message });
    }
});



 
  
  
  

module.exports = router;