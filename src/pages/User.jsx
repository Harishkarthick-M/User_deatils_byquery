import React, { useEffect, useState, useReducer } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Image,
  Text,
  Heading,
  Button,
  Spinner,
  IconButton,
  Flex,
  useColorModeValue,
  Input,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../Firebase/firebaseconfig";

const User = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    avatar: "",
    salary: 0,
  });

  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("lg", "dark-lg");

  const initialSalaryState = { salary: 0 };

  function salaryReducer(state, action) {
    switch (action.type) {
      case "increment":
        return { salary: state.salary + action.payload };
      case "decrement":
        return { salary: Math.max(0, state.salary - action.payload) };
      case "set":
        return { salary: action.payload };
      default:
        throw new Error("Unhandled action type");
    }
  }

  const [salaryState, dispatch] = useReducer(salaryReducer, initialSalaryState);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser(data);
          setFormData({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            avatar: data.avatar || "",
            salary: data.salary || 0,
          });
          dispatch({ type: "set", payload: data.salary || 0 });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleEditClick = () => setIsEditing(true);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      avatar: user.avatar || "",
      salary: user.salary || 0,
    });
    dispatch({ type: "set", payload: user.salary || 0 });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const docRef = doc(db, "users", id);
      const updatedData = { ...formData, salary: salaryState.salary };
      await updateDoc(docRef, updatedData);
      setUser(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner
          size="xl"
          thickness="4px"
          speed="0.55s"
          emptyColor="gray.200"
          color="purple.600"
        />
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex direction="column" align="center" justify="center" h="100vh">
        <Text color="red.400" fontSize="lg">
          User not found.
        </Text>
        <Button mt={4} colorScheme="purple" onClick={() => navigate("/")}>
          Go Back
        </Button>
      </Flex>
    );
  }

  return (
    <Flex justify="center" mt={10} px={4}>
      <Box
        p={8}
        bg={cardBg}
        borderRadius="lg"
        boxShadow={cardShadow}
        maxW="md"
        w="full"
      >
        {!isEditing ? (
          <>
            <Flex justify="end">
              <IconButton
                colorScheme="purple"
                aria-label="edit"
                icon={<EditIcon />}
                onClick={handleEditClick}
              />
            </Flex>
            <Flex direction="column" align="center" gap={4}>
              {user.avatar && (
                <Image
                  src={user.avatar}
                  alt="User Avatar"
                  borderRadius="full"
                  boxSize="120px"
                />
              )}
              <Heading size="md" color="purple.500">
                {user.first_name} {user.last_name}
              </Heading>
              <Text color="gray.500">{user.email}</Text>
              <Text color="gray.700" fontWeight="semibold">
                Salary: ₹{user.salary.toLocaleString()}
              </Text>
              <Button colorScheme="purple" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </Flex>
          </>
        ) : (
          <Flex direction="column" gap={4}>
            <FormControl>
              <FormLabel htmlFor="first_name" color="purple.700">
                First Name
              </FormLabel>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                focusBorderColor="purple.500"
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="last_name" color="purple.700">
                Last Name
              </FormLabel>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                focusBorderColor="purple.500"
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="email" color="purple.700">
                Email
              </FormLabel>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                focusBorderColor="purple.500"
              />
            </FormControl>

            <FormControl>
              <FormLabel color="purple.700">
                Salary: ₹{salaryState.salary.toLocaleString()}
              </FormLabel>
              <Flex gap={2} align="center">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  width="40%"
                  focusBorderColor="purple.500"
                  min={0}
                />
                <Button
                  colorScheme="green"
                  onClick={() =>
                    dispatch({ type: "increment", payload: customAmount })
                  }
                  isDisabled={!customAmount || customAmount <= 0}
                >
                  +₹{customAmount}
                </Button>
                <Button
                  colorScheme="orange"
                  onClick={() =>
                    dispatch({ type: "decrement", payload: customAmount })
                  }
                  isDisabled={!customAmount || customAmount <= 0}
                >
                  -₹{customAmount}
                </Button>
              </Flex>
            </FormControl>

            <Flex justify="space-between" gap={4} mt={4}>
              <Button colorScheme="red" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button colorScheme="purple" onClick={handleSubmit}>
                Save Changes
              </Button>
            </Flex>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

export default User;
