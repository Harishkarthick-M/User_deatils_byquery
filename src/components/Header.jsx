import { Box, Flex, Heading, Spacer, Button } from "@chakra-ui/react";

function Header() {
  return (
    <Box bg="purple.300" px={4} py={2} boxShadow="md">
      <Flex align="center">
        <Heading size="md" color="white">
          MyApp
        </Heading>
        <Spacer />
        <Flex gap={2}>
          <Button variant="ghost" color="white">
            Home
          </Button>
          <Button variant="ghost" color="white">
            About
          </Button>
          <Button variant="ghost" color="white">
            Contact
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Header;
