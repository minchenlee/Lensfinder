import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import './home_page.css'
import Layout from '../layout/layout'
import Modal from '../modal/modal'



function Block({type, title, text, videoPath}){
  return (
    <div className={type}>
      <div className='row'>
        <div className='col-md-5 offset-md-1 intro-box'>
          <video src={videoPath} type="video/mov" autoPlay={true}
          preload="true" loop={true} className="video" muted={true}/>
        </div>
        <div className='col-md-5 intro-box intro-box-text'>
          <div className='intro-text text-start intro-text-large'>
            <p className='mb-3'>{title}</p>
          </div>
          <div className='intro-text text-start intro-text-normal'>
            <p className='mb-0'>
              {text}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Block2({type, title, text, videoPath}){
  return (
    <div className={type}>
      <div className='row'>
        <div className='col-md-5 offset-md-1 intro-box intro-box-text'>
          <div className='intro-text text-start intro-text-large'>
            <p className='mb-3'>{title}</p>
          </div>
          <div className='intro-text text-start intro-text-normal'>
            <p className='mb-0'>
              {text}
            </p>
          </div>
        </div>
        <div className='col-md-5 intro-box'>
          <video src={videoPath} type="video/mov" autoPlay={true}
          preload="true" loop={true} className="video" muted={true}/>
        </div>
      </div>
    </div>
  )
}



function Block3({type, title, text, videoPath}){
  return (
    <div className={type}>
      <div className='row'>
        <div className='px-5 mb-4 col-md-5 offset-md-1 intro-box'>
          <video src={videoPath} type="video/mov" autoPlay={true}
          preload="true" loop={true} className="video" muted={true}/>
        </div>
        <div className='col-md-5 intro-box intro-box-text'>
          <div className='intro-text text-start intro-text-large'>
            <p className='mb-3'>{title}</p>
          </div>
          <div className='intro-text text-start intro-text-normal'>
            <p className='mb-0'>
              {text}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}




function HomePage() {

  return (
    <Layout>
      <div className="home-page-container desktop">
        <Block 
          type='home-page-block'
          title='LensFinder: Discover Your Photography Insights' 
          text='LensFinder simplifies the analysis process, providing you with valuable insights into your photography habits. With ease, upload your images and uncover the patterns that shape your unique style.'
          videoPath='https://lensfinder.s3.ap-northeast-1.amazonaws.com/videos/upload-tutorial.mov'
        />
        <Block2
          type='home-page-block-shorter glass-dark'
          title='Intuitive Dashboard: "Essentials at a Glance"'
          text='Our intuitive dashboard showcases the essentials: ISO, aperture, shutter speed, focal length, and lens model. It is a seamless blend of information, giving you a clearer picture of your photographic journey.'
          videoPath='https://lensfinder.s3.ap-northeast-1.amazonaws.com/videos/dashboard-tutorial.mov'
        />
        <Block
          type='home-page-block'
          title='Personalized Recommendations: "Elevate Your Photography Game"'
          text='LensFinder goes beyond data analysis. It empowers you with personalized lens recommendations based on your most frequently used focal length. Now, you can make informed choices to elevate your photography game.'
          videoPath='https://lensfinder.s3.ap-northeast-1.amazonaws.com/videos/switchpage-tutorial.mov'
        />
        <Block2
          type='home-page-block-shorter glass-dark'
          title='Saving and Revisiting: "Your Photography Archive"'
          text='Save and revisit each analysis effortlessly. LensFinder becomes your archive, allowing you to track your progress and reflect on your growth as a photographer.'
          videoPath='https://lensfinder.s3.ap-northeast-1.amazonaws.com/videos/save-tutorial.mov'
        />
        <div className="home-page-block position-relative">
          <Link className='round-container glass-dark ' to="/analysis">
            <p className='intro-text-littel-large mb-0'>Ready to Explore?</p>
            <p className='intro-text-normal text-start mb-0'>Unlock the hidden potential of your EXIF data with LensFinder. It's a practical companion that reveals new perspectives, empowering you to capture moments like never before.</p>
            <i className="bi bi-arrow-right-circle intro-text-large"></i>
          </Link>
        </div>
      </div>
      <div className="home-page-container mobile">
        <Block3 
          type='home-page-block'
          title='LensFinder: Discover Your Photography Insights' 
          text='LensFinder simplifies the analysis process, providing you with valuable insights into your photography habits. With ease, upload your images and uncover the patterns that shape your unique style.'
          videoPath='https://lensfinder.s3.ap-northeast-1.amazonaws.com/videos/upload-tutorial.mov'
        />
        <Block3
          type='home-page-block-shorter glass-dark'
          title='Intuitive Dashboard: "Essentials at a Glance"'
          text='Our intuitive dashboard showcases the essentials: ISO, aperture, shutter speed, focal length, and lens model. It is a seamless blend of information, giving you a clearer picture of your photographic journey.'
          videoPath='https://lensfinder.s3.ap-northeast-1.amazonaws.com/videos/dashboard-tutorial.mov'
        />
        <Block3
          type='home-page-block'
          title='Personalized Recommendations: "Elevate Your Photography Game"'
          text='LensFinder goes beyond data analysis. It empowers you with personalized lens recommendations based on your most frequently used focal length. Now, you can make informed choices to elevate your photography game.'
          videoPath='https://lensfinder.s3.ap-northeast-1.amazonaws.com/videos/switchpage-tutorial.mov'
        />
        <Block3
          type='home-page-block-shorter glass-dark'
          title='Saving and Revisiting: "Your Photography Archive"'
          text='Save and revisit each analysis effortlessly. LensFinder becomes your archive, allowing you to track your progress and reflect on your growth as a photographer.'
          videoPath='https://lensfinder.s3.ap-northeast-1.amazonaws.com/videos/save-tutorial.mov'
        />
        <div className="home-page-block position-relative">
          <Link className='round-container glass-dark ' to="/analysis">
            <p className='intro-text-littel-large mb-0'>Ready to Explore?</p>
            <p className='intro-text-normal text-start mb-0'>Unlock the hidden potential of your EXIF data with LensFinder. It's a practical companion that reveals new perspectives, empowering you to capture moments like never before.</p>
            <i className="bi bi-arrow-right-circle intro-text-large"></i>
          </Link>
        </div>
      </div>
      <Modal/>
    </Layout>
  )
}

export default HomePage