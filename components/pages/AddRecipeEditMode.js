import React,  {useEffect, useLayoutEffect, useState} from 'react';
import { View, Text, TextInput, Button, SafeAreaView, ImageBackground, StyleSheet, TouchableOpacity, Dimensions, Modal, ScrollView, Touchable} from 'react-native';
import unitData from "../partials/units";
import Ionicons from "@expo/vector-icons/Ionicons";
import {Picker} from "@react-native-picker/picker";
import styles from "../styles/AddRecipeEditModeStyle";
import unitJSON from "../partials/units";
import storage from "../helpers/Storage.js";
import Recipe from "../models/Recipe.js";
import colors from "../constants/colors.js";
import CameraTest from '../helpers/Camera';

export default function AddRecipeEditMode(props, {id}){
  [data,setData] = useState([]);
  const [mode,setMode] = useState("ingredients")
  const [selectedUnit, setSelectedUnit] = useState("g");
  const [ingredientValue, setIngredientValue] = useState("");
  const [amountValue, setAmountValue] = useState();
  const [instructions, setInstructions] = useState([]);
  const [instructionValue, setInstructionValue] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [portionSize, setPortionSize] = useState(1);
  const [prepTime, setPrepTime] = useState("");
  const [titleValue, setTitleValue] = useState("Titel");
  const [editIngredient, setEditIngredient] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editedUnit, setEditedUnit] = useState("g");
  const [editIndex, setEditIndex] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [cameraModal, setCameraModal] = useState(false)
  const [newImage, setNewImage] = useState("")


  //new ingredient for Edit mode
  const [newIngredient, setNewIngredient] = useState("")
  const [newIngredientAmount, setNewIngredientAmount] = useState("")
  const [newIngredientUnit, setNewIngredientUnit] = useState("")

  const [editingID, setEditingID] = useState();

  const [editMode, setEditMode] = useState(false);

  const changeMode = (newMode) => {
    setMode(newMode)
  }

const addIngredient = () => {
  if (ingredientValue !== "" && amountValue !== "") {
    const newIngredient = {
      ingredient: ingredientValue,
      amount: amountValue,
      unit: selectedUnit
    };
    const updatedIngredients = [...ingredients, newIngredient];
    setIngredients(updatedIngredients);
    setIngredientValue("");
    setAmountValue("");
  }
}

const addNewIngredientEdit = () => {
  if(newIngredient !== "" && newIngredientAmount !== ""){
    const newInput = {
      ingredient: newIngredient,
      amount: newIngredientAmount,
      unit: newIngredientUnit
    };
    const updatedIngredients = [...ingredients, newInput];
    setIngredients(updatedIngredients);
    setNewIngredient("");
    setNewIngredientAmount("");
  }
  
}

const addInstructions = () => {
  if (instructionValue !== "") {
    const updatedInstruction = [...instructions, instructionValue];
    setInstructions(updatedInstruction);
    setInstructionValue("");
  }
};

  const saveDataToRecipe = async () => {
    const allRecipes = await storage.getData();
    const newID = storage.generateIDFromData(allRecipes);
    await storage.addData(new Recipe(
      newID,
      category,
      titleValue,
      ingredients,
      instructions,
      description,
      portionSize,
      prepTime,
      newImage
    ));
    await storage.removeData(editingID);
    props.navigation.navigate("Recipes");
  }
  const handleSave = () => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[editIndex] = {
      ingredient: editIngredient,
      amount: editAmount,
      unit: editedUnit
    };
    setIngredients(updatedIngredients);
    closeModal();
  }
  const recalculatePortionSize = (newPortionSize) => {
    if (newPortionSize === 0 || isNaN(newPortionSize)) {
      return;
    } else {
      const updatedIngredients = [...ingredients];
      updatedIngredients.forEach((ingredient) => {
        ingredient.amount = (ingredient.amount / portionSize) * newPortionSize;
      });
      setIngredients(updatedIngredients);
      setPortionSize(newPortionSize);
    }
  };


  
  useEffect(() => {
    const getCurrentRecipe = async() => {
      if(props != null && props.route.params?.editingRecipe?.id != undefined){
        const data =  await storage.getDataWithId(props.route.params.editingRecipe.id);
        if(data != null){
          setData(data);
          setTitleValue(data.title);
          setPortionSize(data.portions);
          setPrepTime(data.time);
          setNewImage(data.image);
          setIngredients(data.ingredients);
          setInstructions(data.instructions);
          setCategory(data.categoryID);
          setEditingID(props.route.params.editingRecipe.id);
          props.navigation.setOptions({
            title: data.title === "" ? "No title" : data.title
          })
          setEditMode(true);
        }
      }
    }
    getCurrentRecipe()
  }, [])

  useLayoutEffect(() => {
    if (id !== null) {
      props.navigation.setOptions({
        //headerTitle: //getDataWithId().name
      })
    }
  })
  const changeTitle = (text) => {
      setTitleValue(text);
  };
  const openModal = (index) => {
    const selectedIngredient = ingredients[index];
    setEditIndex(index);
    setEditIngredient(selectedIngredient.ingredient);
    setEditedUnit(selectedIngredient.unit);
    setEditAmount(selectedIngredient.amount);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false)
  }

  if(!editMode) {

  return (
    <View style={{ overflow: "scroll", height: "100%" }}>
      <ImageBackgroundComponent setCameraModal={setCameraModal} recipeTITLE={titleValue}  imageSRC={newImage ? newImage : null} changeTitle={changeTitle}/>
      <CameraTest setImage={setNewImage} cameraModal={cameraModal} setCameraModal={setCameraModal} />
      <View style={styles.textContainer}>
        <View style={styles.textRow}>
          <TouchableOpacity style={{backgroundColor: mode === "ingredients" ? colors.primary:colors.background, borderRadius: 50, paddingHorizontal: 15, paddingVertical: 5}} onPress={() =>changeMode("ingredients")}>
            <Text style={{fontSize: 20}}>Zutaten</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{backgroundColor: mode === "steps" ? colors.primary:colors.background, borderRadius: 50, paddingHorizontal: 15, paddingVertical: 5}} onPress={() =>changeMode("steps")}>
            <Text style={{fontSize: 20}}>Zubereitung</Text>
          </TouchableOpacity>
        </View>
        {mode === "ingredients" ? (
          <View>
            <View style={styles.iconContainer}>
              <View style={{ padding: 5 }}>
                <Ionicons name="people-outline" size={30} color="black"  />
                <TextInput
                  style={{ padding: 5, textAlign: "center" }}
                  keyboardType={"numeric"}
                  value={portionSize.toString()}
                  onChangeText={(text) =>
                    recalculatePortionSize(parseInt(text))
                  }
                ></TextInput>
              </View>
              <View style={{ padding: 5, alignItems: "center" }}>
                <Ionicons name="time-outline" size={30} color="black" />
                <TextInput
                  style={{ padding: 5, textAlign: "center" }}
                  placeholder={"insert time"}
                  value={prepTime}
                  onChangeText={(text) => setPrepTime(text)}
                ></TextInput>
              </View>
              <View style={{ padding: 5 }}>
                <Ionicons name="heart-outline" size={30} color="black" />
              </View>
            </View>
            {/* Kategorie View */}
            <View style={styles.categorieContainer}>
              <Text style={{fontSize: 20, fontWeight: "bold", paddingVertical: 5, borderRadius: 10, width: 150}}>Kategorie:</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderRadius: 10,
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                  fontSize: 20,
                  padding: 5,
                  maxWidth: "40%"
                }}
                placeholder="Kategorie"
                value={category}
                onChangeText={(text) => setCategory(text)}
              />
            </View>
            <View style={{backgroundColor:"black", height: 1, marginVertical:10 }}/>
            {/* Zutaten View */}
            <View style={styles.ingredientsContainer}>
              <Text style={styles.textSize}>Zutaten</Text>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={addIngredient}
                  style={{
                    justifyContent: "center",
                    alignContent: "center",
                  }}
                >
                  <Ionicons name="add-circle-outline" size={25} color="black" />
                </TouchableOpacity>
                <TextInput
                  style={{
                    fontSize: 20,
                    textAlign: "center",
                    marginRight: 10,
                    maxWidth: "50%"
                  }}
                  placeholder="Zutat hinzufügen"
                  value={ingredientValue}
                  onChangeText={(text) => setIngredientValue(text)}
                />
                <TextInput
                  inputMode="numeric"
                  style={{ fontSize: 20, textAlign: "center", maxWidth:"10%" }}
                  value={amountValue}
                  onChangeText={(text) => setAmountValue(text)}
                  placeholder="Menge"
                />
                <Picker
                  style={{ height: 50, width: 130 }}
                  selectedValue={selectedUnit}
                  onValueChange={(itemValue, itemIndex) =>
                    setSelectedUnit(itemValue)
                  }
                >
                  {unitData.map((unit, index) => {
                    return (
                      <Picker.Item
                        key={index}
                        label={unit.label}
                        value={unit.value}
                      />
                    );
                  })}
                </Picker>
              </View>
              <SafeAreaView style={{ padding: 5 }}>
                <ScrollView
                  style={{ height: "65%", paddingBottom: 5 }}
                  contentContainerStyle={{ marginBottom: 5 }}
                >
                  {ingredients.map((ingredient, index) => {
                    return (
                      <View
                        style={{
                          width: "100%",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                        key={index}
                      >
                        <Text style={{ paddingBottom: 5, fontSize: 20 }}>
                          {ingredient.amount} {ingredient.unit}{" "}
                          {ingredient.ingredient}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                          }}
                        >
                          <TouchableOpacity
                            style={{
                              paddingRight: 20,
                            }}
                            onPress={() => openModal(index)}
                          >
                            <Ionicons name="pencil" size={20} color="black" />
                          </TouchableOpacity>
                          {/* DIVIDER HIER HIN  */}
                          <Modal
                            visible={isModalVisible}
                            animationType="slide"
                            onRequestClose={closeModal}
                          >
                            <View style={{}}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: 50,
                                }}
                              >
                                <Text
                                  style={{ fontSize: 20, paddingRight: 10 }}
                                >
                                  Zutat bearbeiten:
                                </Text>
                                <TextInput
                                  style={{
                                    fontSize: 15,
                                    justifyContent: "center",
                                    alignSelf: "center",
                                  }}
                                  value={editIngredient}
                                  onChangeText={(text) =>
                                    setEditIngredient(text)
                                  }
                                  placeholder="Zutat"
                                />
                              </View>

                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Text style={{ fontSize: 20 }}>
                                  Unit bearbeiten:
                                </Text>
                                <Picker
                                  style={{ height: 50, width: 130 }}
                                  selectedValue={editedUnit}
                                  onValueChange={(itemValue, itemIndex) =>
                                    setEditedUnit(itemValue)
                                  }
                                >
                                  {unitJSON.map((unit, index) => {
                                    return (
                                      <Picker.Item
                                        key={index}
                                        label={unit.label}
                                        value={unit.value}
                                      />
                                    );
                                  })}
                                </Picker>
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  paddingTop: 50,
                                }}
                              >
                                <Text
                                  style={{ fontSize: 20, paddingRight: 15 }}
                                >
                                  Menge bearbeiten:
                                </Text>
                                <TextInput
                                  style={{
                                    fontSize: 18,
                                    justifyContent: "center",
                                    alignSelf: "center",
                                  }}
                                  value={editAmount}
                                  onChangeText={(text) => setEditAmount(text)}
                                  placeholder="Menge"
                                  keyboardType="numeric"
                                />
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "center",
                                  paddingTop: 50,
                                }}
                              >
                                <Button
                                  title="Speichern"
                                  onPress={handleSave}
                                />
                                <Button
                                  title="Abbrechen"
                                  onPress={closeModal}
                                />
                              </View>
                            </View>
                          </Modal>
                          <TouchableOpacity
                            onPress={() => {
                              const updatedIngredients = [...ingredients];
                              updatedIngredients.splice(index, 1);
                              setIngredients(updatedIngredients);
                            }}
                            style={{}}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={20}
                              color="black"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </SafeAreaView>
            </View>
          </View>
        ) : (
          <View style={{ paddingTop: 30, paddingLeft: 10 }}>
            <View style={{ flexDirection: "column" }}>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={addInstructions}>
                  <Ionicons name="add-circle-outline" size={25} color="black" />
                </TouchableOpacity>
                
                <TextInput
                  value={instructionValue}
                  onChangeText={(text) => setInstructionValue(text)}
                  style={styles.textSize}
                  placeholder="Schritt hinzufügen"
                />
              </View>
              <View style={{backgroundColor:"black", height: 1, marginVertical:10 }}/>
              {instructions.length > 0 ? (
                <SafeAreaView style={{ padding: 20 }}>
                  <ScrollView
                    style={{ paddingBottom: 5, height: "85%" }}
                    contentContainerStyle={{ marginBottom: 5 }}
                  >
                    {instructions.map((instruction, index) => {
                      return (
                        <View
                          style={{
                            width: "80%",
                            flexDirection: "row",
                            paddingBottom: 20,
                            justifyContent: "space-between",
                          }}
                          key={index}
                        >
                          <Text style={{ fontSize: 15, maxWidth: "80%" }}>
                            {" "}
                            {instruction}
                          </Text>

                          <TouchableOpacity
                            style={{ alignItems: "center" }}
                            onPress={() => {
                              const updatedInstructions = [...instructions];
                              updatedInstructions.splice(index, 1);
                              setInstructions(updatedInstructions);
                            }}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={25}
                              color="black"
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </ScrollView>
                </SafeAreaView>
              ) : null}
            </View>
          </View>
        )}
      </View>
        <SafeAreaView style={{position: "absolute",
          bottom: 0,
          width: "100%",
          backgroundColor: colors.primary,
          paddingLeft: 10,
          paddingBottom: 10,
          paddingRight: 10}}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center",}}>
                <TouchableOpacity onPress={() => {props.navigation.navigate("Home");}}>
                  <Ionicons name="trash-outline" size={30} color="black" />
               </TouchableOpacity>
              <Text style={styles.textSize}>Edit Mode</Text>
              <TouchableOpacity onPress={saveDataToRecipe}>
                <Ionicons name="checkmark-circle-outline" size={30} color="black" />
              </TouchableOpacity>
            </View>

          
        </SafeAreaView>
    </View>
  );

} else{
  return(
    <View style={{overflow: "scroll", height: "100%"}}>
      <ImageBackgroundComponent recipeTITLE={titleValue} changeTitle={changeTitle} setCameraModal={setCameraModal} imageSRC={newImage ? newImage : null}/>
      <CameraTest setImage={setNewImage} cameraModal={cameraModal} setCameraModal={setCameraModal} />
      <View style={styles.textContainer}>
        <View style={styles.textRow}>
          <TouchableOpacity style={{backgroundColor: colors.primary, borderRadius: 50, paddingHorizontal: 15, paddingVertical: 5}} onPress={() =>changeMode("ingredients")}>
            <Text style={{fontSize: 20}}>Zutaten</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{backgroundColor: colors.primary, borderRadius: 50, paddingHorizontal: 15, paddingVertical: 5}} onPress={() =>changeMode("steps")}>
            <Text style={{fontSize: 20}}>Zubereitung</Text>
          </TouchableOpacity>
        </View>
      </View>
      {mode === "ingredients" ? (
        <View>
          <View style={{display: 'flex', flexDirection:'row', flexWrap: 'wrap', gap: 30, justifyContent: 'center', marginVertical: 15}}>
            <View style={{}}>
              <Ionicons name="people-outline" size={30} color="black" />
              <TextInput style={{textAlign: 'center'}}
                keyboardType='numeric' value={portionSize.toString()} onChangeText={(text) => recalculatePortionSize(parseInt(text))}  />
            </View>
              <View style={{display: 'flex', alignItems:'center'}}>
                <Ionicons name="time-outline" size={30} color="black" />
                <Text >
                  {prepTime}
                </Text>
              </View>
              <View style={{display: 'flex', alignItems:'center'}}>
                <Ionicons name="heart-outline" size={30} color="black" />
              </View>
          </View>
        {/* Kategorie*/}
          <View style={styles.categorieContainer}>
              <Text style={{fontSize: 20, fontWeight: "bold", paddingVertical: 5, borderRadius: 10,}}>Kategorie:</Text>
              <TextInput style={{borderWidth: 1,
                  borderRadius: 10,
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                  fontSize: 20,
                  padding: 5,
                  maxWidth: "40%"}} placeholder={category}  value={category} onChangeText={(text) => setCategory(text)} />
          </View>
        {/* zutaten*/}

          <View style={styles.ingredientsContainer}>
            <View style={{flexDirection : 'row', alignItems: 'center', justifyContent:'space-evenly', borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth*2}}>
              <Text style={styles.textSize}>Zutaten</Text>
              <TextInput style={{paddingLeft: 20, maxWidth: "20%"}} placeholder='Menge' value={newIngredientAmount} onChangeText={(text) => {setNewIngredientAmount(text);}} />
              <Picker
                  style={{paddingLeft: 0, width: 120}}
                  selectedValue={newIngredientUnit}
                  onValueChange={(itemValue, itemIndex) =>
                    setNewIngredientUnit(itemValue)
                  }
                >
                  {unitData.map((unit, index) => {
                    return (
                      <Picker.Item
                        key={index}
                        label={unit.label}
                        value={unit.value}
                      />
                    );
                  })}
                </Picker>
                <TextInput  style={{maxWidth: "20%"}}placeholder='Zutat' value={newIngredient} onChangeText={(text) => {setNewIngredient(text);}} />
                <TouchableOpacity onPress={addNewIngredientEdit}>
                  <Ionicons name="checkmark" size={20} color="black"/>
                </TouchableOpacity>
            </View>

            <View>
              <SafeAreaView style={{ height: Dimensions.get("window").height/3.8, padding: 5 }}>
                <ScrollView
                    style={{ paddingBottom: 5 }}
                    contentContainerStyle={{ marginBottom: 5 }}>
                      {ingredients.map((ingredient, index) => {
                        return(
                          <View style={{display: "flex", flexDirection:"row", maxWidth: "100%"}} key={index}>
                              <Text style={{fontSize: 16,width: 50, maxWidth: "75%"}}>{ingredient.amount}</Text>
                              <Text style={{fontSize: 16,width: 50}}>{ingredient.unit}</Text>
                              <Text style={{fontSize: 16,maxWidth: "70%"}}>{ingredient.ingredient}</Text>
                            <TouchableOpacity style={{ marginLeft: "auto"}} onPress={() => openModal(index)} >
                              <Ionicons name="pencil" size={25} color="black" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                             const updatedIngredients = ingredients.filter((_, i) => i !== index);
                            setIngredients(updatedIngredients);
                             
                            }}>
                              <Ionicons name="trash-outline" size={20} color="black"/>

                            </TouchableOpacity>
                            <Modal
                            visible={isModalVisible}
                            animationType="slide"
                            onRequestClose={closeModal}
                          >
                            <View style={{}}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: 50,
                                }}
                              >
                                <Text
                                  style={{ fontSize: 20, paddingRight: 10 }}
                                >
                                  Zutat bearbeiten:
                                </Text>
                                <TextInput
                                  style={{
                                    fontSize: 15,
                                    justifyContent: "center",
                                    alignSelf: "center",
                                  }}
                                  value={editIngredient}
                                  onChangeText={(text) =>
                                    setEditIngredient(text)
                                  }
                                  placeholder="Zutat"
                                />
                              </View>

                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Text style={{ fontSize: 20 }}>
                                  Unit bearbeiten:
                                </Text>
                                <Picker
                                  style={{ height: 50, width: 130 }}
                                  selectedValue={editedUnit}
                                  onValueChange={(itemValue, itemIndex) =>
                                    setEditedUnit(itemValue)
                                  }
                                >
                                  {unitJSON.map((unit, index) => {
                                    return (
                                      <Picker.Item
                                        key={index}
                                        label={unit.label}
                                        value={unit.value}
                                      />
                                    );
                                  })}
                                </Picker>
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  paddingTop: 50,
                                }}
                              >
                                <Text
                                  style={{ fontSize: 20, paddingRight: 15 }}
                                >
                                  Menge bearbeiten:
                                </Text>
                                <TextInput
                                  style={{
                                    fontSize: 18,
                                    justifyContent: "center",
                                    alignSelf: "center",
                                  }}
                                  value={editAmount}
                                  onChangeText={(text) => setEditAmount(text)}
                                  placeholder="Menge"
                                  keyboardType="numeric"
                                />
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "center",
                                  paddingTop: 50,
                                }}
                              >
                                <Button
                                  title="Speichern"
                                  onPress={handleSave}
                                />
                                <Button
                                  title="Abbrechen"
                                  onPress={closeModal}
                                />
                              </View>
                            </View>
                          </Modal>
                          </View>
                        )
                      })}



                    </ScrollView>
                </SafeAreaView>
            </View>
         </View>


        </View>



       ) : (
        <View style={{ paddingTop: 30, paddingLeft: 10 }}>
          <View style={{ flexDirection: "column"}}>
            <View style={{ flexDirection: "row",borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth * 2}}>
              <TouchableOpacity onPress={addInstructions}>
                    <Ionicons name="add-circle-outline" size={25} color="black" />
              </TouchableOpacity>
              <TextInput
                    value={instructionValue}
                    onChangeText={(text) => setInstructionValue(text)}
                    style={styles.textSize}
                    placeholder="Schritt hinzufügen"
                  />
            </View>
            </View>
            {instructions.length > 0 ? (
              <SafeAreaView style={{padding:20}}>
                <ScrollView style={{paddingBottom: 5, height: Dimensions.get("window").height/2.2}} contentContainerStyle={{marginBottom: 5}}>
                    {instructions.map((instruction, index) => {
                      return (
                        <View style={{width: "100%", flexDirection:'row', paddingBottom: 20}} key={index}>
                          <Text style={{fontSize: 20, maxWidth: "80%"}}> {instruction}</Text>
                          <View style={{marginLeft: "auto", flexDirection:'row'}}>
                          <TouchableOpacity style={{alignItems:'center'}} onPress={() => {
                            const updatedInstruction = [...instructions];
                            updatedInstruction.splice(index,1);
                            setInstructions(updatedInstruction);
                          }}>
                            <Ionicons name="trash-outline" size={25} color= "black"></Ionicons>
                          </TouchableOpacity>
                          <TouchableOpacity>
                            <Ionicons name="pencil" size={25} color="black"></Ionicons>
                          </TouchableOpacity>
                          </View>
                        </View>
                      )
                    })}
                </ScrollView>
              </SafeAreaView>

            ) : null}
                
            </View>
        
        )
      }
      <SafeAreaView style={{position: "absolute",
          bottom: 0,
          width: "100%",
          backgroundColor: colors.primary,
          paddingLeft: 10,
          paddingBottom: 10,
          paddingRight: 10}}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center",}}>
                <TouchableOpacity onPress={() => {props.navigation.navigate("Home");}}>
                  <Ionicons name="trash-outline" size={30} color="black" />
               </TouchableOpacity>
              <Text style={styles.textSize}>Edit Mode</Text>
              <TouchableOpacity onPress={saveDataToRecipe}>
                <Ionicons name="checkmark-circle-outline" size={30} color="black" />
              </TouchableOpacity>
            </View>

          
        </SafeAreaView>
    </View>
  )
}
}



const ImageBackgroundComponent = ({imageSRC, recipeTITLE, changeTitle, setCameraModal}) => {
  const [childRecipeTitle, setChildRecipeTitle] = useState("")
  return (
    <View>
      <ImageBackground
      resizeMode="cover"
      style={{height: 200}}
      source={{uri: imageSRC} }>
        <View style={{position: 'absolute', bottom: 0, flexDirection: 'row', alignItems: 'center', width: "100%",backgroundColor: 'rgba(211,211,211, 0.5)', justifyContent: 'space-between'}}>
        <TextInput style={{fontSize: 20,marginLeft: 10, color: "black", maxWidth: "85%"}} placeholder={recipeTITLE} value={recipeTITLE} onChangeText={(text) => {changeTitle(text);}}/>
        <TouchableOpacity style={{marginRight: 10}} onPress={() => {setCameraModal(true)}}>
          <Ionicons name="camera-outline" size={30} color="black"/>
        </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
    );
}
