import React from 'react'
export default function Footer(){
  return (
    <footer className="site-footer">
      <div className="container" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ color:'#475569' }}>© {new Date().getFullYear()} TaskBoard — Built with ❤️ by Vivek kumar Gupta</div>
        <div style={{ display:'flex', gap:12 }}>
          <a href="#">Docs</a>
          <a href="#">Privacy</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  )
}
