"use client";

import React, { useEffect, useRef } from 'react';
import $ from 'jquery';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'summernote/dist/summernote-bs4.min.js';
const SummernoteEditor = ({ content, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    $(editorRef.current).summernote({
      height: 200,
      callbacks: {
        onChange: (contents) => {
          onChange(contents);
        }
      }
    });

    // Set initial content
    $(editorRef.current).summernote('code', content);

    return () => {
      $(editorRef.current).summernote('destroy');
    };
  }, [content, onChange]);

  return (
    <div ref={editorRef}></div>
  );
};

export default SummernoteEditor;