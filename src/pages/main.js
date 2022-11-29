import React, { useState } from "react";
import { Button } from "@material-ui/core";
import Spreadsheet from "react-spreadsheet";
import * as XLSX from "xlsx";
import validateNationalIdentityNumber from "national-identity-validator";
import "./Upload.css";
import exportExcel from "../utils/index.js";
import fileTemplate from "../template/template-excel.xlsx";
var FileSaver = require("file-saver");

const Main = () => {
  const [selectedFile, setSelectedFile] = useState();
  const [processValue, setProcessValue] = useState([]);
  const [newData, setNewData] = useState([]);
  const [verifyData, setVerifyData] = useState(false);

  const dropHandler = (e) => {
    e.preventDefault();
    if (e.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...e.dataTransfer.items].forEach((item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          const file = item.getAsFile();

          setSelectedFile(file);

          readExcel(file);
          readToCSV(file);
          readExcel(file);
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

  const readToCSV = (file, checkValue) => {
    checkValue && setVerifyData(true);

    if (file.length > 0) {
      let newArray = [];
      // const fileReader = new FileReader();
      // fileReader.readAsArrayBuffer(file);

      // fileReader.onload = (e) => {
      //   const bufferArray = e?.target.result;
      //   const wb = XLSX.read(bufferArray, {
      //     // type: "buffer",
      //     cellDates: true,
      //     dateNF: "dd/mm/yy",
      //   });

      //   const wsname = wb.SheetNames[0];
      //   const ws = wb.Sheets[wsname];

      //   const data = XLSX.utils.sheet_to_json(ws);

      //   data.map((element) => {
      //     let tempDate = element?.dob?.getDate()?.toString();
      //     let tempMonth = element?.dob?.getMonth() + 1;
      //     let tempYear = element?.dob?.getFullYear().toString();
      //     let tempDOB = tempDate + "/" + tempMonth + "/" + tempYear;

      //     newArray.push([
      //       { value: element.id },
      //       { value: element.surname },
      //       { value: tempDOB },
      //       { value: element.result },
      //     ]);
      //   });
      //   if (newArray.length === file.length) {
      //     setNewData(newArray);
      //   }
      // };

      file.map((element) => {
        let tempDate = element?.dob?.length > 0 && element?.dob?.getDate()?.toString();
        let tempMonth = element?.dob?.length > 0 && element?.dob?.getMonth() + 1;
        let tempYear = element?.dob?.length > 0 && element?.dob?.getFullYear().toString();
        let tempDOB = element?.dob?.length > 0
          ? tempDate + "/" + tempMonth + "/" + tempYear
          : "";

        newArray.push([
          { value: element.id },
          { value: element.surname },
          { value: tempDOB },
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
        const wb = XLSX.read(bufferArray, {
          // type: "buffer",
          cellDates: true,
          dateNF: "dd/mm/yy",
        });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json(ws);
        data.map((element) => {
          console.log(element)
          let tempDate = element?.dob?.length > 0 && element?.dob?.getDate()?.toString();
          let tempMonth =element?.dob?.length > 0 && element?.dob?.getMonth() + 1;
          let newTempMonth =element?.dob?.length > 0 && tempMonth < 10 ? "0" + tempMonth : tempMonth;
          let tempYear =element?.dob?.length > 0 && element?.dob?.getFullYear().toString();
          let tempDOB = element?.dob?.length > 0 && tempDate + "/" + newTempMonth + "/" + tempYear;

          newArray.push([
            { value: element.id },
            { value: element["surname"] },
            { value: element["dob"] ? tempDOB : "" },
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
      const wb = XLSX.read(bufferArray, {
        // type: "buffer",
        cellDates: true,
        dateNF: "dd/mm/yy",
      });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      const data = XLSX.utils.sheet_to_json(ws);
      let newArray = [];
      data.forEach((element) => {
        let tempDate = element?.dob?.length > 0 && element?.dob?.getDate()?.toString();
        let tempMonth = element?.dob?.length > 0 && element?.dob?.getMonth() + 1;
        let newTempMonth = element?.dob?.length > 0 && tempMonth < 10 ? "0" + tempMonth : tempMonth;
        let tempYear = element?.dob?.length > 0 && element?.dob?.getFullYear().toString();
        let tempDOB = element?.dob?.length > 0 && tempDate + "/" + newTempMonth + "/" + tempYear;

        if (element["id"]) {
          let value = validateNationalIdentityNumber(
            element["id"]?.toUpperCase(),
            element["surname"] && element["surname"]?.toUpperCase(),
            element["dob"] && tempDOB
          );

          value
            ? newArray.push({
                ...element,
                id: element?.id?.toUpperCase(),
                result: value == true && "Valid",
              })
            : newArray.push({
                ...element,
                result: value == false && "Invalid",
              });
        }
      });
      setProcessValue(newArray);
    };
  };

  const downloadTemplateExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const value = [{ id: "", surname: "", dob: "" }];

    const val = XLSX.utils.json_to_sheet(value);
    const wb = { Sheets: { data: val }, SheetNames: ["sheet1"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, val, "Sheet1");
    XLSX.writeFile(workbook, "template-excel.xlsx", { compression: true });
    // FileSaver.saveAs(data, "template-excel" + fileExtension);
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

  const resetAll = () => {
    setVerifyData(false);
    window.location.reload();
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
        <Button
          style={{
            marginTop: "20px",
            marginBottom: "20px",
            backgroundColor: "#70C369",
            color: "white",
          }}
          variant="contained"
          fullWidth
          onClick={downloadTemplateExcel}
        >
          Download Excel Template
        </Button>
        {exportExcel(fileTemplate)}
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
              <span className="support">
                {!!selectedFile && selectedFile?.name}
              </span>
            </div>
          </div>
        </div>

        {!!selectedFile && (
          <Button
            style={{ marginTop: "20px" }}
            variant="contained"
            fullWidth
            onClick={() => readToCSV(processValue, true)}
          >
            VERIFY
          </Button>
        )}

        {!!verifyData && (
          <Button
            style={{ marginTop: "20px" }}
            variant="contained"
            fullWidth
            onClick={() => readExcelJsonData(selectedFile.name, processValue)}
          >
            Download
          </Button>
        )}

        {!!selectedFile && (
          <Button
            style={{ marginTop: "20px" }}
            variant="contained"
            fullWidth
            onClick={resetAll}
          >
            Reset
          </Button>
        )}
      </div>

      {newData?.length > 0 && (
        <div
          style={{ marginTop: "10px", overflowY: "scroll", height: "250px" }}
        >
          <Spreadsheet data={newData} />
        </div>
      )}
    </div>
  );
};

export default Main;
