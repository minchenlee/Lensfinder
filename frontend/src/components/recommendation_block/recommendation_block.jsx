import React, { useContext, useState, useRef} from 'react';
import { AllPageContext } from '../../App.jsx';
import { analysisContext } from '../analysis_page/analysis_page.jsx';
import { profileContext } from '../profile_page/profile_page.jsx';
import './recommendation_block.css';

function RecommendationBlock(){
  return(
    <div className="container-fluid">
      <div className="recommendation-block-title">
        <div className="row">
          <h3>Recommendation</h3>
        </div>
      </div>
    </div>
  )
}

export default RecommendationBlock;