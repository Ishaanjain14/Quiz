// import  React from "react";
import "./instructions.css"
export const InstructionsPage = () => {
  return (
    <div className="instructions-container">

      <main className="instructions-content">
        <h2>GENERAL INSTRUCTIONS</h2>
        <p className="instructions-note">Please read the instructions carefully</p>

        <ol className="instructions-list">
          <li>Total duration of Quiz- 180 minutes.</li>
          <li>
            The clock will be set at the server. The countdown timer will display the remaining time. The exam will end automatically when time runs out.
          </li>
          <li>
            The Questions Palette displayed on the right will indicate the question status:
            <ul className="status-legend">
              <li><span className="status-box not-visited"></span> You have not visited the question.</li>
              <li><span className="status-box not-answered"></span> You have not answered the question.</li>
              <li><span className="status-box answered"></span> You have answered the question.</li>
              <li><span className="status-box marked"></span> You have NOT answered but marked the question for review.</li>
              <li><span className="status-box marked-answered"></span> Answered and Marked for Review (considered for evaluation).</li>
            </ul>
          </li>
          <li>
            Navigation:
            <ul>
              <li>Click the arrow <strong>{">"}</strong> to collapse/expand the question palette.</li>
              <li>Click on the profile image to change the exam language.</li>
              <li>Use <span className="scroll-down">⬇</span> to go to the bottom and <span className="scroll-up">⬆</span> to return to the top.</li>
            </ul>
          </li>
          <li>
            <strong>Navigating to a Question:</strong>
            <ul>
              <li>Click a number in the question palette to directly go to that question.</li>
              <li>Click <strong>Save & Next</strong> to save your answer and move forward.</li>
            </ul>
          </li>
        </ol>
        
        {/* Proceed Button */}
        <div className="proceed-button-container">
          <a href='/exam'><button className="proceed-button">Proceed</button></a>
        </div>
      </main>
    </div>
  );
};