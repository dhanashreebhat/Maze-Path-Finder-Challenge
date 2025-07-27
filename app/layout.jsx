// Root layout component wrapping the app with basic HTML structure
import React from 'react';
import PropTypes from 'prop-types';
import './styles.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node,
};
