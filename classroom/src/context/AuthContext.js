
import React from 'react'

import { createContext, useContext,useState,useEffect } from 'react'


const AuthContext = createContext();

export const useAuth = () =>{
    return useContext(AuthContext);
}

export const AuthProvider = ({children}) => {

    const [auth,setAuth] = useState({user:null , loading:true});

    // to check if user loggin in or not when page is being changed
    useEffect(()=>{
        const user = JSON.parse(localStorage.getItem('user'));

        if(user){
            setAuth({user , loading :false});
        }
        else{
            setAuth({user : null , loading : false});
        }
    },[])


    const login = (userData) =>{
        localStorage.setItem('user',JSON.stringify(userData));
        setAuth({user : userData , loading : false});
    }

    const logout = (userData) =>{
        localStorage.removeItem('user');
        setAuth({user : null , loading : false});
    }

  return (
    <AuthContext.Provider value = {{auth,login,logout}}> {!auth.loading && children}</AuthContext.Provider>
  )
}

