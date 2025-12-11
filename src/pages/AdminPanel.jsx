import {useAuth} from "@/context/AuthContext.jsx";

export default function AdminPanel(){
    const {user} = useAuth();
    return <p>Hi {user?.firstName}</p>
}