import { css } from '@emotion/react';

export const songListStyles = css`
  .song-list {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Arial', sans-serif;
  }

  .song-card {
    background: #f8f1e9;
    border-left: 4px solid #e74c3c;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 0 4px 4px 0;
    
    h3 {
      color: #2c3e50;
      margin-top: 0;
    }
    
    p {
      margin: 5px 0;
      color: #7f8c8d;
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    gap: 10px;
    
    button {
      background: #3498db;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      
      &:disabled {
        background: #bdc3c7;
        cursor: not-allowed;
      }
    }
  }
`;