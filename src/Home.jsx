import './App.css'
import axios from "axios"
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router';
import { Button } from 'react-bootstrap';
import { InputGroup } from 'react-bootstrap';

export function Home() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('token'));
        if (!data) {
            navigate('/login');
        }
        getFiles();
    }, [])


    async function getFiles() {
        const token = await JSON.parse(localStorage.getItem('token'));
        try {
            const response = await axios.get("http://localhost:8000/file", {
                headers: {
                    'Authorization': token
                }
            })
            setFiles(response.data);
        } catch (err) {
            console.log(err);
        }
    };

    async function uploadFile() {
        try {
            const input = document.getElementById("input");
            const formdata = new FormData();
            if (input.files.length == 0) {
                alert("NO File Selected")
                return;
            }

            formdata.append("files", input.files[0]);
            setUploading(!uploading);
            const token = await JSON.parse(localStorage.getItem('token'));
            const data = await fetch("http://localhost:8000/upload", {
                method: "POST",
                body: formdata,
                headers: {
                    'Authorization': token
                }
            });
            if (data.status == 200) {
                setUploading(false)
                const files = await getFiles();
                setFiles(files.data);
            }
        } catch (err) {
            console.log(err)
        }
    };

    async function handleDelete(e, f) {
        try {
            const token = await JSON.parse(localStorage.getItem('token'));
            const resp = await fetch(`http://localhost:8000/delete/${e}`, {
                headers: {
                    'Authorization': token
                }
            });
            const resp2 = await axios.delete(`http://localhost:8000/file/${f}`, {
                headers: {
                    'Authorization': token
                }
            })
            if (resp && resp2) {
                alert('File Deletd Successfully');
            }
            await getFiles();
        } catch (err) {
            alert('Some error occured please try again later')
        }
    }

    function handleLogout(){
        try{
            localStorage.clear('token');
            navigate("/login")
        }catch(err){
            console.log(err);
            alert("Some error occured")
        }
    }

    return (
        <div>
            <div className='logout'>
            <Button variant='secondary' size="sm" onClick={handleLogout}>Logout</Button>
            </div>
            <h1>Please Select file to upload</h1>
            {
                !uploading ? <div className='uploadinput'>
                    <input id="input" type='file'></input>
                    <Button onClick={uploadFile} className='btn'>Upload</Button>
                </div> : <p>Please wait uplloading file</p>
            }
            <br/>
            <br/>
            <h3>Recently Uploaded Files</h3>
            <div className='infoBox'>
                {files.length ? files.map((e) => {
                    return (<div className='info' key={e.fileId}>
                        <div className='info1'>
                            <div className='info11'>
                                <a href={`http://localhost:8000/download/${e.name}`} title={e.name} download={e.name}>{e.name}</a>
                            </div>
                            <div className='trash'>
                                <img src='public/trash.png' onClick={() => { handleDelete(e.fileId.toString(), e._id) }}></img>
                            </div>
                        </div>
                        <div className='info2'>
                            <p className='about'>File Type:</p>
                            <p className='name'>{e.type.split("/")[1]}</p>
                        </div>
                        <div className='info3'>
                            <p className='about'>Date Updated:</p>
                            <p className='name'>{new Date(e.createdAt).toLocaleString()}</p>
                        </div>
                    </div>)
                }) :<p className='nofiles'>No Files found for user</p>}
            </div>
        </div>
    )
}

export default Home
