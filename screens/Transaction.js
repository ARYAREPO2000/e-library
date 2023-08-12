import React, { Component } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  ToastAndroid
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import { color } from "react-native-elements/dist/helpers";
import db from '../config';
import { collection,query,where,getDocs, addDoc, Timestamp, updateDoc, increment } from "firebase/firestore";

const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");

export default class TransactionScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bookId: "",
      studentId: "",
      domState: "normal",
      hasCameraPermissions: null,
      scanned: false
    };
  }

  

  getCameraPermissions = async domState => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
      hasCameraPermissions: status === "granted",
      domState: domState,
      scanned: false
    });
  };

  handleBarCodeScanned = async ({ type, data }) => {
    const { domState } = this.state;

    if (domState === "bookId") {
      this.setState({
        bookId: data,
        domState: "normal",
        scanned: true
      });
    } else if (domState === "studentId") {
      this.setState({
        studentId: data,
        domState: "normal",
        scanned: true
      });
    }
  };

  getBookDetails = async(bookId)=>{
    bookId = bookId.trim();

    let dbQuery=query(
      collection(db,"books"),
      where ("book_id","==",bookId)
    );
    let bookRef=await getDocs(dbQuery);
    bookRef.forEach((doc)=>{
      this.setState({
        bookName:doc.data().book_details.book_name
      })
    })
  }
  getStudentDetails = async(studentId)=>{
    studentId = studentId.trim();

    let dbQuery=query(
      collection(db,"students"),
      where ("student_id","==",studentId)
    );
    let studentRef=await getDocs(dbQuery);
    studentRef.forEach((doc)=>{
      this.setState({
        studentName:doc.data().student_details.student_name
      })
    })
  }

  handleTransaction=async()=>{
    var {bookId,studentId}=this.state;
    await this.getBookDetails(bookId);
    await this.getStudentDetails(studentId)
    var dbquery = query(
      collection(db,"books"),
      where("book_id","==",bookId)
    );
    var bookRef = await getDocs(dbquery);
    bookRef.forEach((doc)=>{
      console.log(doc.data());
      var book=doc.data();
      if (book.is_book_available) {
        var {bookName,studentName} = this.state
        this.initiateBookIssue(bookId,bookName,studentId,studentName)
      } else {
        var {bookName,studentName} = this.state
        this.initiateBookreturn(bookId,bookName,studentId,studentName)
      }
    });
    
  }

  initiateBookIssue=async(bookId,bookName,studentId,studentName)=>{
    const docRef = await addDoc(collection(db,"transactions"),
    {
      student_id:studentId,
      student_name:studentName,
      book_id:bookId,
      book_name:bookName,
      date:Timestamp.fromDate(new Date()),
      transaction_type:"issue"
    });
    const booksRef = doc(db,"books", bookId)
    await updateDoc(booksRef,{
      is_book_available:false
    });

    const studentRef = doc(db,"students", studentId)
    await updateDoc(booksRef,{
      number_of_books_issued:increment(1)
  });
  this.setState({bookId:'',studentId:''})
  }

  initiateBookreturn=async(bookId,bookName,studentId,studentName)=>{
    const docRef = await addDoc(collection(db,"transactions"),
    {
      student_id:studentId,
      student_name:studentName,
      book_id:bookId,
      book_name:bookName,
      date:Timestamp.fromDate(new Date()),
      transaction_type:"return"
    });
    const booksRef = doc(db,"books", bookId)
    await updateDoc(booksRef,{
      is_book_available:true
    });

    const studentRef = doc(db,"students", studentId)
    await updateDoc(booksRef,{
      number_of_books_issued:increment(-1)
  });
  this.setState({bookId:'',studentId:''})
  }

  render() {
    const { bookId, studentId, domState, scanned } = this.state;
    if (domState !== "normal") {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ImageBackground source={bgImage} style={styles.bgImage}>
          <View style={styles.upperContainer}>
            <Image source={appIcon} style={styles.appIcon} />
            <Image source={appName} style={styles.appName} />
          </View>
          <View style={styles.lowerContainer}>
            <View style={styles.textinputContainer}>
              <TextInput
                style={styles.textinput}
                placeholder={"Book Id"}
                placeholderTextColor={"#FFFFFF"}
                value={bookId}
                onChangeText={(text)=>{this.setState({bookId:text})}}
              />
              <TouchableOpacity
                style={styles.scanbutton}
                onPress={() => this.getCameraPermissions("bookId")}
              >
                <Text style={styles.scanbuttonText}>Scan</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.textinputContainer, { marginTop: 25 }]}>
              <TextInput
                style={styles.textinput}
                placeholder={"Student Id"}
                placeholderTextColor={"#FFFFFF"}
                value={studentId}
                onChangeText={(text)=>{this.setState({studentId:text})}}
              />
              <TouchableOpacity
                style={styles.scanbutton}
                onPress={() => this.getCameraPermissions("studentId")}
              >
                <Text style={styles.scanbuttonText}>Scan</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={this.handleTransaction}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  bgImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },
  upperContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center"
  },
  appIcon: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 80
  },
  appName: {
    width: 80,
    height: 80,
    resizeMode: "contain"
  },
  lowerContainer: {
    flex: 0.5,
    alignItems: "center"
  },
  textinputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "#9DFD24",
    borderColor: "#FFFFFF"
  },
  textinput: {
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: "#5653D4",
    fontFamily: "Rajdhani_600SemiBold",
    color: "#FFFFFF"
  },
  scanbutton: {
    width: 100,
    height: 50,
    backgroundColor: "#9DFD24",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  scanbuttonText: {
    fontSize: 24,
    color: "#0A0101",
    fontFamily: "Rajdhani_600SemiBold"
  },
  submitButton: {
    width:'43%',
    height:55,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:15,
    backgroundColor:'#f48d20'
  },

  buttonText:{
    fontSize:24,
    fontFamily: 'Rajdhani_600SemiBold',
    color:'#ffffff'
  }

});