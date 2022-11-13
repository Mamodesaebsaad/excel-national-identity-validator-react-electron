import React, { useState } from "react";
import { Button } from "@material-ui/core";
import Spreadsheet from "react-spreadsheet";
import * as XLSX from "xlsx";
import validateNationalIdentityNumber from "national-identity-validator";
import './Upload.css';
var FileSaver = require("file-saver");



const Main = () => {
  const [selectedFile, setSelectedFile] = useState();
  const [processValue, setProcessValue] = useState([]);
  const [newData, setNewData] = useState([]);

  const dropHandler = (e) => {
    e.preventDefault();
    if (e.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...e.dataTransfer.items].forEach((item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          const file = item.getAsFile();
          // console.log(file);
          // console.log(file?.name)
          setSelectedFile(file);
          //   console.log(file?.name);
          // setSelectedFile(e.target.files[0]);
          readExcel(file);
          readToCSV(file);
          readExcel(file);

          // console.log(`… file[${i}].name = ${file.name}`);
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...e.dataTransfer.files].forEach((file, i) => {
        setSelectedFile(file);

        readExcel(file);
        // console.log(`… file[${i}].name = ${file.name}`);
      });
    }
  };

  const dragOverHandler = (e) => {
    e.preventDefault();
    // setSelectedFile(e.target.files[0]);
    // readExcel(e.target.files[0]);
  };

  const onFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    /* Reading the excel file and converting it to json. */
    // fileReader(e.target.files[0]);
    readToCSV(e.target.files[0]);
    readExcel(e.target.files[0]);
  };

  const readToCSV = (file) => {
    if (file.length > 0) {
      let newArray = [];
      file.map((element) => {
        newArray.push([
          { value: element.id },
          { value: element.result },
        ]);
      });

      if (newArray.length === file.length) {
        setNewData(newArray);
      }
    } else {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        let newArray = [];
        const bufferArray = e?.target.result;
        const wb = XLSX.read(bufferArray, { type: "buffer" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json(ws);
        data.map((element) => {
          newArray.push([
            { value: element.id },
            // { value: element["First Name"] },
          ]);
        });

        if (newArray.length === data.length) {
          setNewData(newArray);
        }
      };
    }
  };

  const readExcel = async (file) => {
    const fileReader = await new FileReader();
    fileReader.readAsArrayBuffer(file);

    fileReader.onload = (e) => {
      const bufferArray = e?.target.result;
      const wb = XLSX.read(bufferArray, { type: "buffer" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      const data = XLSX.utils.sheet_to_json(ws);
      let newArray = [];
      data.forEach((element) => {
        if (element["id"]) {
          let value = validateNationalIdentityNumber(element["id"]);

          value
            ? newArray.push({ ...element, result: value == true && "Valid" })
            : newArray.push({
                ...element,
                result: value == false && "Invalid",
              });
        }
      });
      setProcessValue(newArray);
    };
  };

  const readExcelJsonData = (filename, verifyValue) => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const val = XLSX.utils.json_to_sheet(verifyValue);
    const wb = { Sheets: { data: val }, SheetNames: ["data"] };

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, filename + "_modified" + fileExtension);
  };

  return (
    <div
      style={{
        // border: "1px solid red",

        marginRight: "10px",
        marginLeft: "10px",
        marginTop: "20px",
        padding: "5px",
      }}
    >
      <div>
        <div className="top">
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <div className="title" style={{ textAlign: "center" }}>
              Upload your excel file
            </div>

            <div
              className="drag-area"
              onDrop={dropHandler}
              onDragOver={dragOverHandler}
              //   onDragOver={dragOverHandler}
            >
              <span className="header">Drag & Drop</span>
              <span className="header">
                or
                <span className="button">
                  <Button
                    variant="outlined"
                    component="label"
                    onChange={onFileChange}
                  >
                    Browse
                    <input hidden accept="xlsx/*" multiple type="file" />
                  </Button>
                </span>
              </span>

              <input type="file" hidden />
              <span className="support">Supports: xlsx</span>
              <span className="support">{selectedFile?.name}</span>
            </div>
          </div>
        </div>

        <Button
          style={{ marginTop: "20px" }}
          variant="contained"
          fullWidth
          onClick={() => readToCSV(processValue)}
        >
          VERIFY
        </Button>
        <Button
          style={{ marginTop: "20px" }}
          variant="contained"
          fullWidth
          onClick={() => readExcelJsonData(selectedFile.name, processValue)}
        >
          Download
        </Button>
      </div>

      <div style={{ marginTop: "10px" }}>
        <Spreadsheet data={newData} />
      </div>
    </div>
  );
};

export default Main;
