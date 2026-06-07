import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import {Auth} from "./Axios/userAxios";


export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //check session on app start
  useEffect(() => {
    const checkAuth = async() => {
      try {
        const data  = await Auth();
        setUser(data);
      } catch (error) {
         setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

  }, []);
  if ( loading) {
    //to change after
    return <div> Loading ... </div>
  }
  //if NOT LOGGED IN
  if(!user) {
    return (
      <Login onSuccess={(loggedUser) => {
        setUser(loggedUser);
      }}
      />
    );
  }
  // LOGGED IN -> OPEN DASHBOARD
  return <Dashboard user={user} />;
}