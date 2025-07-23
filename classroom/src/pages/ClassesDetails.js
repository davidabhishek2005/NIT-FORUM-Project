
import React from 'react'
import {useState , useEffect} from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './ClassesDetails.css';
import dummyImage from '../pages/avatar-1577909_640.png';



const ClassesDetails = () => {

  const  {classid} = useParams();

  const {auth} = useAuth();
  const [classroom , setClassroom] = useState(null);
  const [loading , setLoading] = useState(true);
  const [user,setUser] = useState(null);
  const [showPopup , setShowPopup] = useState(false);
  const [postTitle , setPostTitle] = useState('');
  const [postDescription , setPostDescription] = useState('');

  const [showJoinPopup , setShowJoinPopup] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpPopup , setShowOtpPopup] = useState(false);
  const [otpError , setOtpError] = useState('');

  const navigate = useNavigate();

  const [file,setFile] = useState(null);
  const [note , setNote] = useState('');
  const [fileURL, setFileURL] = useState(null);
  const [fileName,setFileName] = useState(null);
  
  // const [files,setFiles] = useState([]);

  // useEffect(() =>{
  //   fetchFiles()
  // } ,[]);

  const [files, setFiles] = useState([]);

  useEffect(() => {
      const fetchFiles = async () => {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/${classid}/files`);
          const data = await response.json();
          setFiles(data);
      };

      fetchFiles();
  }, []);


  const fetchFiles = async() =>{
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/files`);
    const data = await response.json();
    setFiles(data);
    
  }


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () =>{
    if(!file || !note){
      alert('Please select a file and enter note');
      return;
    }

    const formData = new FormData();
    formData.append('file',file);
    formData.append("note",note);
    formData.append('classId',classid);

    console.log(formData);

    try{
      const response  = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/classes/uploads`,{
        method:'POST',
        credentials:'include',
        body:formData,
      });

      if(!response.ok){
        throw new Error('File upload failed');
      }

  

      const data = await response.json();
      //setFileURL(`${process.env.REACT_APP_API_BASE_URL}${data.fileUrl}`);
      setFileName(data.fileName);
      setFileURL(`${process.env.REACT_APP_API_BASE_URL}/files/${data.fileName}`);
      alert('File uploaded successfully');
      fetchFiles();
      
    }
    catch(err){
      alert('Error processing file')
    }
  }

  const fetchClassDetails = async () => {
    try{
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/getclassbyid/${classid}`,{
        method:'GET',
        credentials:'include',
      });
  
      const data = await response.json();
  
      if(response.ok){
        setClassroom(data.data);
        console.log('class',data.data);
      }
      else{
        toast.error(data.message || 'Failed to fetch class details');
      }
    }
    catch(err){
      toast.error('Error fetching class details');
    }
    finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClassDetails();
  },[classid]);

  useEffect(() => {
    const fetchUser = async () =>{
      try{
        const response = await fetch (`${process.env.REACT_APP_API_BASE_URL}/auth/getuser`,{
          method:'GET',
          credentials : 'include',
        });
  
        const data = await response.json();
  
        if(response.ok){
          setUser(data.data);
        }
        else{
          toast.error(data.message || 'Failed to fetch user data');
        }
      }
      catch(err){
        toast.error('An error occurred while fetching user data')
      }
    };
    
    fetchUser();
  },[]);

  const handleAddPost = () =>{
    setShowPopup(true); // show the popup

  }
  const handleSubmitPost = async () => {
    try{
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/addpost`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body: JSON.stringify({
          title: postTitle,
          description:postDescription,
          classId: classid,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if(response.ok){
        toast.success('Post created successfully');
        setPostTitle('');
        setPostDescription('');
        setShowPopup(false);
        fetchClassDetails();
      }
      else{
        toast.error(data.message || 'Failed to create post');
      }
    }
    catch(err){
      toast.error('An error occurred while creating the post');
    }
  }

  const handleClosePopup = () =>{
    setShowPopup(false);
  }
  const handleJoinRequest = async () => {
     try{
        const response  = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/request-to-join`,{
          method:'POST',
          headers:{
            'Content-Type' : 'application/json',
          },
          body : JSON.stringify({
            classroomId : classid,
            studentEmail: user?.email,
          }),
          credentials:'include',
        });

        const data = await response.json();

        if(response.ok){
          setShowJoinPopup(false);
          setShowOtpPopup(true);
          toast.success('OTP sent to the class owner');
        }
        else{
          toast.error(data.message || 'Failed to send join request');
        }
     }
     catch(err){
      toast.error('An error occurred while sending join request')
     }
  }
  
  const handleSubmitOtp = async () => {
    try{
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/verify-otp`,{
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify({
          classroomId : classid,
          studentEmail : user?.email,
          otp
        }),
        credentials:"include",
      });

      const data = await response.json();

      if(response.ok){
        setOtp('');
        setShowOtpPopup(false);
        toast.success('SUccessfully joined the class');
        fetchClassDetails();
      }
      else{
        setOtpError(data.message || 'Failed to verify OTP');
      }
    }
    catch(err){
      toast.error('An error occurred while verifying OTP');
    }
  }

  const handleCloseOtpPopup = () => {
    setShowOtpPopup(false);
    setOtpError('');
  }

  if(loading) {
    return <div className='loading'>Loading...</div>
  }

  const isStudent  = classroom?.students?.includes(user?.email);
  const isOwner = classroom?.owner === user?._id;


  return (
    <div className='class-details'>
        <div className='section1'>
            <img src = {dummyImage} alt = "Classroom" className='class-image' />
            <h1 className='class-name'>{classroom?.name}</h1>
            <p className='class-description'>{classroom?.description}</p>

            { isOwner && (
              <button className='add-post-btn' onClick={handleAddPost}>Add Post</button>
              
            )}

            { isOwner && (
              <div className="upload-container">
                  <h2 className="title">Upload Notes</h2>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter note title"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <input type="file" className="file-input" onChange={handleFileChange} accept=".pdf,.docx,.xlsx" />
                  <button className="upload-btn" onClick={handleUpload}>
                    Upload
                  </button>

              </div>
            )}

            { !isStudent && !isOwner && (
              <button className='add-post-btn' onClick ={() => setShowJoinPopup(true)}>Join Class</button>
            )}
        </div>

        <div className='post-grid'>
        {
          (isStudent || isOwner) && classroom?.posts?.length > 0 ? (
            classroom.posts.map((post, index) => (
              <div key={index} className="post-card">
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                {/* <small>{new Date(post.createdAt).toLocaleDateString()}</small> */}
              </div>

              

            ))
          ) : (
            <p>No posts available</p>
          )

        }
      </div>


      <div className='post-grid'>
        {
          (isStudent || isOwner) && classroom?.posts?.length > 0 ? (
            files.map((file) => (
                <div key={file._id} className="border p-4 rounded shadow">
                  <h3 className="font-semibold">{file.filename}</h3>
                  <p className="text-sm">{file.note}</p>
                  <a
                    href={`${process.env.REACT_APP_API_BASE_URL}/files/download/${file._id}`}
                    download={file.filename}
                    className="mt-2 inline-block bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Download
                  </a>
                </div>
              ))
          ) : (
            <p>No posts available</p>
          )

        }
      </div>

        {showPopup && (
          <div className='popup-overlay'>
            <div className='popup-content'>
            <h3>Add Post</h3>
            <input type ='text' placeholder = 'Title' value = {postTitle} onChange = {(e) => setPostTitle(e.target.value)}/>

            <textarea placeholder='Description' value={postDescription} onChange={(e) => setPostDescription(e.target.value)} />

            <div className='popup-buttons'>
              <button onClick={handleSubmitPost}>Submit</button>
              <button onClick={handleClosePopup}>Close</button>
            </div>
            </div>

          </div>
        )}


        {showJoinPopup && (
          <div className='popup-overlay'>
            <div className='popup-content'>
              <h3>Join Request</h3>
              <p> Do you want  to join this class ? An OTP will be sent to the class owner for approval</p>

              <div className='popup-buttons'>
                <button onClick = {handleJoinRequest}>Send Join Request</button>
                <button onClick = {() => setShowJoinPopup(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {showOtpPopup && (
          <div className='popup-overlay'>
            <div className='popup-content'>
              <h3>Enter OTP</h3>
              <input type='text' placeholder ="Enter OTP" value ={otp} onChange ={(e) => setOtp(e.target.value)}/>

              {otpError && <p className='otp-error'>{otpError}</p>}

              <div className='popup-buttons'>
                <button onClick={handleSubmitOtp}>Submit</button>
                <button onClick={handleCloseOtpPopup}>Close</button>
              </div>
            </div>
          </div>
        )}

        
        {/* {fileURL && (
            <div>
              <h3>Download Uploaded File:</h3>
              <a href={fileURL} download = {fileName}>
                Click here to download
              </a>
            </div>
        )} */}

       
    </div>
  )

}

export default ClassesDetails