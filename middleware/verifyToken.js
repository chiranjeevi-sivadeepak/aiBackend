import jwt from 'jsonwebtoken'

const verifyToken=(req,res,next)=> {
  const authHeader = req.headers.authorization;;
  if(!authHeader){
    return res.status(401).json({message:"No token Provided!"});
  }
  const token = authHeader.split(" ")[1];
  if(!token){
    return res.status(401).json({message:"Invalid token format"});
  }
  jwt.verify(token, process.env.JWT_SECRET,(error,decoded)=>{
    if(error){
        return res.status(403).json({message:"Invalid or expired token!"});
    }
    req.user = decoded;
    return next();
  })
}

export default verifyToken;