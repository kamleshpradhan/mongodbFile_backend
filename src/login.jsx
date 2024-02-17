import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
export default function Login() {
    const [user, setUser] = useState({ email: "", password: "" })
    const navigate = useNavigate();
    function handleChange(e) {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    }
    useEffect(() => {
        const token = JSON.parse(localStorage.getItem('token'))
        if (token) {
            navigate("/")
        }
    })
    async function handlelogin() {
        try {
            const resp = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
            const data = await resp.json();
            localStorage.setItem("token", JSON.stringify(data.token));
            if (data) {
                navigate('/')
            }

        } catch (e) {
            console.log(e, "Some error occured");
        }
    }
    return (
        <div className="login">
            <div className="loginmain">
            <label>Email</label>
            <input type="email" name="email" value={user.email} onChange={handleChange} />
            <label>Password</label>
            <input type="password" name="password" value={user.password} onChange={handleChange} />
            <button onClick={handlelogin}>Login</button>
            </div>
        </div>
    )
}