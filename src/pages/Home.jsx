import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Box,
  Heading,
  Input,
  Image,
  IconButton,
  Text,
  SimpleGrid,
  VStack,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Spinner,
  Select,
} from "@chakra-ui/react";
import { FaFilter } from "react-icons/fa";
import { Search2Icon, DeleteIcon, AddIcon } from "@chakra-ui/icons";

import { db } from "../Firebase/firebaseconfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetchUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const Home = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();

  const userDetailsSchema = Yup.object({
    first_name: Yup.string()
      .required("First Name is required")
      .min(3, "min 3 char required"),
    last_name: Yup.string().required("Last Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    avatar: Yup.string().url("Invalid URL").required("Avatar URL is required"),
    role: Yup.string().required("Role is required"),
    salary: Yup.number().min(1000, "min salary will be 1000"),
  });

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const addUserMutation = useMutation({
    mutationFn: async (newUser) => {
      const docRef = await addDoc(collection(db, "users"), newUser);
      return { id: docRef.id, ...newUser };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      toast({
        title: "User added.",
        description: "The new user has been added successfully!",
        status: "success",
        duration: 4000,
        position: "bottom-right",
        isClosable: true,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add user",
        status: "error",
        duration: 4000,
        position: "bottom-right",
        isClosable: true,
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id) => {
      await deleteDoc(doc(db, "users", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      toast({
        title: "Deleted",
        description: "Deleted User successfully",
        status: "warning",
        duration: 4000,
        position: "bottom-right",
        isClosable: true,
      });
    },
  });

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleFilter = (role) => {
    setFilter(role);
  };

  const handleAddUser = (values, actions) => {
    addUserMutation.mutate(values);
    actions.resetForm();
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteUserMutation.mutate(id);
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = user.email.toLowerCase();
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase());
    const matchesFilter = filter ? user.role === filter : true;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="90vh"
      >
        <Spinner
          size="xl"
          thickness="4px"
          speed="0.55s"
          emptyColor="gray.200"
          color="purple.600"
          duration="4000"
        />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box textAlign="center" mt={10}>
        <Text color="red.500">
          Failed to load users. Please try again later.
        </Text>
      </Box>
    );
  }

  return (
    <Box p={5}>
      <Heading textAlign="start" mb={8} color={"purple.700"}>
        Kula India office Members
      </Heading>

      <Box display="flex" flexWrap="wrap" mb={8}>
        <InputGroup maxW="82%">
          <InputLeftElement pointerEvents="none">
            <Search2Icon color="gray.300" />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="Search members"
            value={search}
            onChange={handleSearch}
            borderColor="gray.300"
            _hover={{ borderColor: "purple.400" }}
            _focus={{
              borderColor: "purple.500",
              boxShadow: "0 0 0 1px #9F7AEA",
            }}
          />
        </InputGroup>

        <Menu>
          <MenuButton
            ml="1%"
            as={Button}
            leftIcon={<FaFilter />}
            colorScheme="purple"
          >
            {filter || "Filter"}
          </MenuButton>
          <MenuList>
            {[
              "Frontend",
              "Backend",
              "Fullstack",
              "UI/UX",
              "Product Manager",
              "Testing",
            ].map((role) => (
              <MenuItem key={role} onClick={() => handleFilter(role)}>
                {role}
              </MenuItem>
            ))}
            <MenuItem onClick={() => handleFilter("")}>Clear Filter</MenuItem>
          </MenuList>
        </Menu>

        <Button
          ml="1%"
          leftIcon={<AddIcon />}
          colorScheme="purple"
          onClick={onOpen}
        >
          Add User
        </Button>
      </Box>

      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {filteredUsers.map((user) => (
          <Box
            key={user.id}
            bg="purple.100"
            p={6}
            borderRadius="lg"
            textAlign="center"
            onClick={() => navigate(`/user/${user.id}`)}
            _hover={{ cursor: "pointer" }}
            position="relative"
            role="group"
          >
            <IconButton
              icon={<DeleteIcon />}
              colorScheme="red"
              aria-label="delete"
              size="sm"
              position="absolute"
              top={2}
              right={3}
              opacity={0}
              _groupHover={{ opacity: 1 }}
              onClick={(e) => handleDelete(user.id, e)}
            />
            <VStack spacing={3}>
              <Image
                src={user.avatar}
                alt="User Avatar"
                borderRadius="full"
                boxSize="100px"
              />
              <Text fontWeight="bold" fontSize="3xl">
                {user.first_name} {user.last_name}
              </Text>
              <Text fontSize="xl" color="gray.600">
                {user.email}
              </Text>
              <Text fontSize="sm" color="gray.700">
                {user.role}
              </Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Formik
              initialValues={{
                first_name: "",
                last_name: "",
                email: "",
                avatar: "",
                role: "",
                salary: "",
              }}
              validationSchema={userDetailsSchema}
              onSubmit={handleAddUser}
            >
              {({ isSubmitting }) => (
                <Form>
                  {["first_name", "last_name", "email", "avatar", "salary"].map(
                    (fieldName) => (
                      <Field key={fieldName} name={fieldName}>
                        {({ field, form }) => (
                          <FormControl
                            isInvalid={
                              form.errors[fieldName] && form.touched[fieldName]
                            }
                            mb={4}
                          >
                            <FormLabel>{fieldName}</FormLabel>
                            <Input
                              {...field}
                              placeholder={fieldName}
                              borderColor="gray.300"
                              _hover={{ borderColor: "purple.400" }}
                              _focus={{
                                borderColor: "purple.500",
                                boxShadow: "0 0 0 1px #9F7AEA",
                              }}
                            />
                            <FormErrorMessage>
                              {form.errors[fieldName]}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    )
                  )}

                  <Field name="role">
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={form.errors.role && form.touched.role}
                        mb={4}
                      >
                        <FormLabel>Role</FormLabel>
                        <Select
                          {...field}
                          placeholder="Select Role"
                          borderColor="gray.300"
                          _hover={{ borderColor: "purple.400" }}
                          _focus={{
                            borderColor: "purple.500",
                            boxShadow: "0 0 0 1px #9F7AEA",
                          }}
                        >
                          <option value="Frontend">Frontend</option>
                          <option value="Backend">Backend</option>
                          <option value="Fullstack">Fullstack</option>
                          <option value="Product Manager">
                            Product Manager
                          </option>
                          <option value="UI/UX">UI/UX</option>
                          <option value="Testing">Testing</option>
                        </Select>
                        <FormErrorMessage>{form.errors.role}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <ModalFooter px={0}>
                    <Button
                      colorScheme="purple"
                      mr={3}
                      isLoading={isSubmitting || addUserMutation.isLoading}
                      type="submit"
                    >
                      Add
                    </Button>
                    <Button colorScheme="red" onClick={onClose}>
                      Cancel
                    </Button>
                  </ModalFooter>
                </Form>
              )}
            </Formik>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Home;
