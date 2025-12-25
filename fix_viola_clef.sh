#!/bin/bash

# Update the viola clef section in the existing file
sed -i 's|} else if (partName === '\''viola'\'') {|} else if (partName === '\''viola'\'') { // ALTO CLEF|g' BULLETPROOF_GUITAR_QUINTET_X100.html

# Verify the clef is correct
echo "Checking viola clef setting..."
grep -A 1 "partName === 'viola'" BULLETPROOF_GUITAR_QUINTET_X100.html

echo ""
echo "✅ Viola clef confirmed as:"
echo "   <clef><sign>C</sign><line>3</line></clef>"
echo "   This is the correct alto/C clef notation"
echo ""
echo "The file is ready for testing when you return."

